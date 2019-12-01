import { Observable } from 'rxjs';

import { getConfigFiles, logNoConfigFiles } from './cmd.list';
import { cli, defaultValue, fs, log, PKG, t, time } from './common';

const FILES = [
  'package.json',
  'now.json',
  'yarn.lock',
  'src/common.ts',
  'src/now.ts',
  'src/types.ts',
];

type DeployTarget = 'now';

/**
 * Run a deployment.
 */
export async function run(args: { target: DeployTarget; force?: boolean }) {
  const { target } = args;
  const force = defaultValue(args.force, false);

  log.info.gray(`${PKG.name}: v${log.white(PKG.version)}`);

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
      const res = {
        targetDir,
        path: config.path,
        config: config.data,
        info: [] as string[],
        log: () => {
          log.info.green(`${dirname}`);
          log.info.gray(`${targetDir}/`);
          res.info.forEach(line => log.info(line));
          log.info();
        },
      };
      return res;
    }),
  );

  // Build list of tasks.
  const tasks = deployments.map(deployment => {
    const { targetDir, config } = deployment;
    return deployTask({
      targetDir,
      force,
      prod: true,
      title: `${config.now.domain}: ${config.title}`,
      done: res => (deployment.info = res),
    });
  });

  // Run the deployment tasks.
  log.info();
  await cli.exec.tasks.run(tasks, { silent: false, concurrent: true });

  // Finish up.
  log.info();
  deployments.forEach(deployment => deployment.log());
  log.info();
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
  config: t.IConfigDeployment;
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
      const json = await fs.file.loadAndParse<t.IConfigNowFile>(file.to);

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
  prod: boolean;
  force: boolean;
  done: (info: string[]) => void;
}) {
  const { targetDir, title } = args;
  const task: cli.exec.ITask = {
    title,
    task: () => {
      return new Observable(observer => {
        const prod = args.prod ? '--prod' : '';
        const force = args.force ? '--force' : '';
        const cmd = cli.exec.command(`now ${prod} ${force}`.trim());
        const running = cmd.run({ cwd: targetDir, silent: true });

        const next = (text: string) => {
          text = text.trim().replace(/^-\s*/, '');
          observer.next(text);
        };

        // Track output.
        const info: string[] = [];
        running.output$.subscribe(e => {
          const text = e.text;
          if (info.length > 0 || text.includes('Deployment complete')) {
            info.push(text);
          }
          next(text);
        });

        running.complete$.subscribe(async () => {
          args.done(info); // NB: Send result info back to caller before completing.
          observer.complete();
        });

        // Set initial label.
        time.delay(0, () => next('Connecting to cloud provider...'));
      });
    },
  };

  return task;
}
