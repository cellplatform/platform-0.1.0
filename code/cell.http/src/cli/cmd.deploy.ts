import { Observable } from 'rxjs';

import { getConfigFiles, logNoConfigFiles } from './cmd.list';
import { cli, config, fs, log, t } from './common';

const FILES = [
  'package.json',
  'now.json',
  'yarn.lock',
  'src/common.ts',
  'src/now.ts',
  'src/types.ts',
];

/**
 * Run a deployment.
 */
export async function run() {
  // Read in the config files.
  const files = await getConfigFiles();
  const dir = files.dir;

  // Ensure there is at least one configuration file.
  if (files.isEmpty) {
    return logNoConfigFiles({ dir });
  }

  // Prompt the user for which deployment to run.
  log.info();
  const path = await files.prompt();

  // Load configuration settings.
  const settings = config.loadSync({ path });
  if (!settings.exists) {
    log.info.yellow(`😩  Config file does not exist [.yml]`);
    log.info.gray(settings.path);
    log.info();
    return;
  }

  // Prepare directories.
  const sourceDir = fs.resolve('src.tmpl');
  const targetDir = fs.resolve('tmp/.deploy');
  await fs.remove(targetDir); // Clear existing deloyment.

  // Copy deployment folder.
  const tmpl = await copy({ sourceDir, targetDir });

  // Update: [now.json]
  await (async () => {
    const config = settings.data;
    const now = config.now;
    const file = tmpl.files.find(path => path.to.endsWith('now.json'));
    if (file) {
      const json = await fs.file.loadAndParse<t.IConfigNowFile>(file.to);

      let alias = now.domain;
      alias = now.subdomain ? `${now.subdomain}.${alias}` : alias;

      json.name = now.name;
      json.alias = alias;
      json.env = json.env || {};
      json.env.CELLOS_MONGO = now.mongo;

      fs.file.stringifyAndSaveSync(file.to, json);
    }
  })();

  // Update: [now.ts]
  await (async () => {
    const config = settings.data;
    const now = config.now;
    const file = tmpl.files.find(path => path.to.endsWith('now.ts'));
    if (file) {
      let text = (await fs.readFile(file.to)).toString();

      text = text.replace(/__TITLE__/, config.title);
      text = text.replace(/__DB__/, now.subdomain || 'prod');
      text = text.replace(/__COLLECTION__/, config.collection);

      await fs.writeFile(file.to, text);
    }
  })();

  // Prepare and run the deployment task.
  let info: string[] = [];
  const tasks = deployTask({
    targetDir,
    prod: true,
    force: false,
    done: res => (info = res),
  });
  log.info();
  await cli.exec.tasks.run(tasks, { silent: false });

  // Finish up.
  log.info();
  info.forEach(line => log.info(line));
  log.info();
}

/**
 * [Helpers]
 */

function deployTask(args: {
  targetDir: string;
  prod: boolean;
  force: boolean;
  done: (info: string[]) => void;
}) {
  const task: cli.exec.ITask = {
    title: 'Deploying',
    task: () => {
      return new Observable(observer => {
        const prod = args.prod ? '--prod' : '';
        const force = args.force ? '--force' : '';
        const cmd = cli.exec.command(`now ${prod} ${force}`.trim());
        const running = cmd.run({ cwd: args.targetDir, silent: true });

        // Track output.
        const info: string[] = [];
        running.output$.subscribe(e => {
          const text = e.text;
          if (info.length > 0 || text.includes('Deployment complete')) {
            info.push(text);
          }
          observer.next(text);
        });

        running.complete$.subscribe(async () => {
          args.done(info); // NB: Send result info back to caller before completing.
          observer.complete();
        });
      });
    },
  };

  return task;
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
