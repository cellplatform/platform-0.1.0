import { fs, log, config, t } from './common';
import * as minimist from 'minimist';
import { exec } from '@platform/exec';

const argv = minimist(process.argv.slice(2));

const FILES = [
  'package.json',
  'now.json',
  'yarn.lock',
  'src/common.ts',
  'src/now.ts',
  'src/types.ts',
];

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

/**
 * Prepare and run a deployment.
 */
async function deploy(args: { config: string }) {
  log.info();
  const sourceDir = fs.resolve('src.tmpl');
  const targetDir = fs.resolve('tmp/.deploy');

  // Clear existing deloyment.
  await fs.remove(targetDir);

  // Copy deployment folder.
  const { files } = await copy({ sourceDir, targetDir });

  // Load configuration settings
  const path = fs.resolve(args.config);
  const settings = config.loadSync({ path });
  if (!settings.exists) {
    log.info.yellow(`😩  Config file does not exist [.yml]`);
    log.info.gray(settings.path);
    log.info();
    return;
  }

  if (!settings.data.now.name) {
    log.info.yellow(`😩  The [now] project cannot be unnamed.`);
    log.info.gray(settings.path);
    log.info();
    return;
  }

  // Update: [now.json]
  await (async () => {
    const config = settings.data;
    const now = config.now;
    const file = files.find(path => path.to.endsWith('now.json'));
    const json = await fs.file.loadAndParse<t.IConfigNowFile>(file.to);

    let alias = now.domain;
    alias = now.subdomain ? `${now.subdomain}.${alias}` : alias;

    json.name = now.name;
    json.alias = alias;
    json.env = json.env || {};
    json.env.CELLOS_MONGO = now.mongo;

    fs.file.stringifyAndSaveSync(file.to, json);
  })();

  // Update: [now.ts]
  await (async () => {
    const config = settings.data;
    const now = config.now;
    const file = files.find(path => path.to.endsWith('now.ts'));
    let text = (await fs.readFile(file.to)).toString();

    text = text.replace(/__TITLE__/, config.title);
    text = text.replace(/__DB__/, now.subdomain || 'prod');
    text = text.replace(/__COLLECTION__/, config.collection);

    await fs.writeFile(file.to, text);
  })();

  log.info(settings.data);
  log.info();

  // Deploy.
  const cmd = exec.command('yarn deploy');
  const running = cmd.run({ cwd: targetDir, silent: true });
  running.output$.subscribe(e => log.info(e.text));
  await running;
}

/**
 * Run.
 */
(async () => {
  const config = fs.join('.config', argv._[0] || '');
  deploy({ config });
})();
