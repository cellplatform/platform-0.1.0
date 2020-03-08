import { Observable } from 'rxjs';

import { getConfigFiles, logNoConfigFiles } from './cmd.list';
import { cli, defaultValue, fs, log, PKG, t, time, http } from './common';

const FILES = [
  'package.json',
  'now.json',
  'yarn.lock',
  'src/common.ts',
  'src/constants.ts',
  'src/now.ts',
  'src/types.ts',
  'static/favicon.ico',
];

type DeployTarget = 'now';

/**
 * Run a deployment.
 */
export async function run(args: { target: DeployTarget; force?: boolean; dry?: boolean }) {
  const { target } = args;
  const force = defaultValue(args.force, false);

  log.info.gray(`${PKG.name}: v${PKG.version}`);

  // Read in the config files.
  const files = await getConfigFiles();
  const dir = files.dir;

  // Ensure there is at least one configuration file.
  if (files.isEmpty) {
    return logNoConfigFiles({ dir });
  }

  // Prompt the user for which deployment to run.
  const deployTitle = (args: { active: boolean; force?: boolean }) => {
    const deploy = args.active ? 'Deploying' : 'Deploy';
    const title = args.force ? `${deploy} (forced)` : deploy;
    return title;
  };
  log.info();
  const configs = await files.promptMany({ message: deployTitle({ force, active: false }) });
  if (configs.length === 0) {
    return;
  }

  // Ensure each configuration file is valid.
  let isValid = true;
  for (const config of configs) {
    const validation = config.validate();
    if (!validation.isValid) {
      isValid = false;
      log.info();
      log.info.yellow(`😩  Invalid configuration file.`);
      log.info.gray(`   ${fs.dirname(config.path)}/${log.cyan(fs.basename(config.path))}`);
      validation.errors.forEach(err => {
        log.info.gray(`   ${log.red('Error:')} ${log.white(err.message)}`);
      });
      log.info();
    }
  }
  if (!isValid) {
    return;
  }

  // Prepare folders.
  const sourceDir = await getTmplDir();
  const deployments = await Promise.all(
    configs.map(async config => {
      const dirname = fs.basename(config.path).replace(/\.yml$/, '');
      const targetDir = fs.resolve(`tmp/.deploy/${dirname}`);

      await fs.remove(targetDir); // Clear existing deloyment.
      await copyAndPrepare({ sourceDir, targetDir, config: config.data, target });

      const options = {
        prod: '--prod',
        force: force ? '--force' : '',
        confirm: '--confirm',
        toString() {
          return Object.keys(options)
            .map(key => options[key])
            .filter(value => typeof value !== 'function')
            .reduce((acc, next) => `${acc} ${next}`.trim(), '')
            .trim();
        },
      };
      const cmd = `now ${options.toString()}`;

      const deployment = {
        title: `${config.data.title}`,
        targetDir,
        path: config.path,
        config: config.data,
        cmd,
        info: [] as string[],
        errors: [] as string[],
        async log() {
          const { domain, subdomain } = config.data.now;

          let url = domain;
          url = subdomain ? `${subdomain}.${domain}` : url;
          url = `https://${url}`;

          let info: t.IResGetSysInfo | undefined;
          try {
            info = (await http.get(url)).json as t.IResGetSysInfo;
          } catch (err) {
            log.error(`Failed to read info from ${url}`);
          }

          log.info.green(`${dirname}`);
          if (info) {
            log.info.gray(`• system:     ${info.system}`);
            log.info.gray(`• region:     ${info.region}`);
            log.info.gray(`• deployment: ${info.deployment}`);
            log.info();
          }
          deployment.info.forEach(line => log.info(line));
          deployment.errors.forEach(line => log.error(line));
          log.info();
        },
      };
      return deployment;
    }),
  );

  // Build list of tasks.
  const tasks = deployments.map(deployment => {
    const { title, targetDir, cmd } = deployment;
    return deployTask({
      targetDir,
      cmd,
      title,
      done: res => {
        const { info, errors } = res;
        deployment.info = info;
        deployment.errors = errors;
      },
    });
  });

  // Log list of deployment folders.
  log.info();
  deployments.forEach(deployment => {
    const { targetDir, cmd } = deployment;
    log.info.gray(`cd ${targetDir} && ${cmd}`);
  });

  if (args.dry) {
    log.info();
    log.info.yellow(`DRY RUN 🐷`);
    log.info.green(`Prepared deployment folder but stopped short of deploying.`);
    log.info();
    return;
  }

  // Run the deployment tasks.
  log.info();
  await cli.exec.tasks.run(tasks, { silent: false, concurrent: true });

  // Finish up.
  log.info();
  for (const deployment of deployments) {
    await deployment.log();
  }
  log.info();
}

/**
 * [Helpers]
 */

/**
 * Copy the deployment folder, and make file modifications
 * to the resulting folder.
 */
async function copyAndPrepare(args: {
  sourceDir: string;
  targetDir: string;
  config: t.IHttpConfigDeployment;
  target: DeployTarget;
}) {
  const { sourceDir, targetDir, config } = args;

  // Copy deployment folder.
  const tmpl = await copy({ sourceDir, targetDir });

  // Update: [now.json]
  await (async () => {
    const { now, secret } = config;

    const file = tmpl.files.find(path => path.to.endsWith('now.json'));
    if (file) {
      const json = await fs.file.loadAndParse<t.IHttpConfigNowFile>(file.to);

      let alias = now.domain;
      alias = now.subdomain ? `${now.subdomain}.${alias}` : alias;

      json.name = now.deployment;
      json.alias = alias;
      json.env = json.env || {};
      json.env.CELL_MONGO = secret.mongo;

      fs.file.stringifyAndSaveSync(file.to, json);
    }
  })();

  // Update: [package.json]
  await (async () => {
    const file = tmpl.files.find(path => path.to.endsWith('package.json'));
    if (file) {
      const pkg = await fs.file.loadAndParse<t.INpmPackageJson>(file.to);
      if (pkg.dependencies) {
        pkg.version = pkg.dependencies['@platform/cell.http'];
      }
      if (args.target === 'now') {
        delete pkg.scripts;
        if (pkg.dependencies) {
          delete pkg.dependencies['@platform/fsdb.nedb'];
        }
        if (pkg.devDependencies) {
          delete pkg.devDependencies;
        }
        fs.file.stringifyAndSaveSync(file.to, pkg);
      }
    }
  })();

  // Update: [now.ts]
  await (async () => {
    const now = config.now;
    const file = tmpl.files.find(path => path.to.endsWith('now.ts'));
    if (file) {
      let text = (await fs.readFile(file.to)).toString();

      text = text.replace(/__TITLE__/, config.title);
      text = text.replace(/__DB__/, now.subdomain || 'prod');
      text = text.replace(/__COLLECTION__/, config.collection);
      text = text.replace(/__DEPLOYED_AT__/, time.now.timestamp.toString());
      text = text.replace(/__S3_ENDPOINT__/, config.fs.endpoint);
      text = text.replace(/__S3_ROOT__/, config.fs.root);

      await fs.writeFile(file.to, text);
    }
  })();
}

/**
 * Make a copy of the deployment folder.
 */
async function copy(args: { sourceDir: string; targetDir: string }) {
  // Create base directory.
  const sourceDir = fs.resolve(args.sourceDir);
  const targetDir = fs.resolve(args.targetDir);
  await fs.ensureDir(targetDir);

  // Copy files.
  const files = FILES.map(path => {
    const from = fs.join(sourceDir, path);
    const to = fs.join(targetDir, path);
    return { from, to };
  });
  await Promise.all(files.map(({ from, to }) => fs.copy(from, to)));

  // Finish up.
  return { files };
}

async function getTmplDir() {
  const name = 'src.tmpl';

  const get = async (dir: string) => {
    dir = fs.resolve(dir);
    return (await fs.pathExists(dir)) ? dir : undefined;
  };

  const local = await get(name);
  if (local) {
    return local;
  }

  const nodeModules = await get(`node_modules/@platform/cell.http/${name}`);
  if (nodeModules) {
    return nodeModules;
  }

  throw new Error(`The template directory could not be found.`);
}

function deployTask(args: {
  title: string;
  targetDir: string;
  cmd: string;
  // prod: boolean;
  // force: boolean;
  done: (args: { info: string[]; errors: string[] }) => void;
  deploy?: boolean; // Debug.
}) {
  const { targetDir, title } = args;

  const task: cli.exec.ITask = {
    title,
    task: () => {
      return new Observable(observer => {
        if (args.deploy === false) {
          return observer.complete();
        }

        // const prod = args.prod ? '--prod' : '';
        // const force = args.force ? '--force' : '';
        const cmd = cli.exec.command(args.cmd);
        const running = cmd.run({ cwd: targetDir, silent: true });

        const next = (text: string) => {
          text = text.trim().replace(/^-\s*/, '');
          observer.next(text);
        };

        // Track output.
        const info: string[] = [];
        const errors: string[] = [];
        running.output$.subscribe(e => {
          const isError = e.type === 'stderr';
          const text = e.text;
          if ((!isError && info.length > 0) || text.includes('Deployment complete')) {
            info.push(text);
          }
          if (isError) {
            errors.push(text);
          }
          next(text);
        });

        // running.er

        running.complete$.subscribe(async () => {
          args.done({ info, errors }); // NB: Send result info back to caller before completing.
          observer.complete();
        });

        // Set initial label.
        time.delay(0, () => next('Connecting to cloud provider...'));
      });
    },
  };

  return task;
}
