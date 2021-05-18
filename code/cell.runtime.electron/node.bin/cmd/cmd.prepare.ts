import { exec, fs, log, Logger, ProgressSpinner, t } from '../common';

type Mode = 'dev' | 'make';
const modes: Mode[] = ['dev', 'make'];

type Pkg = {
  name: string;
  version: string;
  workspaces?: { packages: ['*'] };
  resolutions?: { [key: string]: string };
};

const Path = {
  app: fs.resolve('./app'),
  root: fs.resolve('../..'),
  node_modules: fs.resolve('./app/node_modules'),
  pkg: {
    app: fs.resolve('./app/package.json'),
    root: fs.resolve('../../package.json'),
  },
};

/**
 * Prepares the [electron-forge] module for the "make" (packaging) process.
 */
export async function prepare(argv: t.Argv) {
  const mode = ((argv._[1] || '').toLowerCase().trim() || 'dev') as Mode;
  const install = argv.install ?? true;

  if (!modes.includes(mode)) {
    const err = `Unsupported preparation mode "${mode}". Supported modes: ${modes.join(', ')}`;
    return Logger.errorAndExit(1, err);
  }

  log.info();
  log.info(`Prepare electron app for ${log.cyan(mode)}`);

  await preparePackageJson({ mode });
  await runYarn({ mode, install });

  log.info();
}

/**
 * [Helpers]
 */
async function preparePackageJson(args: { mode: Mode }) {
  const { mode } = args;
  const path = Path.pkg;

  const pkg = {
    root: (await fs.readJson(path.root)) as Pkg,
    app: (await fs.readJson(path.app)) as Pkg,
  };

  /**
   * Yarn workspaces.
   */
  if (mode === 'dev') delete pkg.app['workspaces'];
  if (mode === 'make') {
    // NB: This overrides the base @platform workspaces configuration
    //     meaning that the node_modules are installed locally to the
    //     project which [electron-forge] requires to bundle.
    pkg.app.workspaces = { packages: ['*'] };
  }

  /**
   * Yarn resolutions.
   */
  if (mode === 'dev') delete pkg.app['resolutions'];
  if (mode === 'make') pkg.app.resolutions = pkg.root.resolutions;

  /**
   * Save file changes.
   */
  await fs.writeFile(path.app, JSON.stringify(pkg.app, null, '  '));
}

async function runYarn(args: { mode: Mode; install: boolean }) {
  const { mode } = args;

  /**
   * Delete [node_modules].
   */
  const spinner = ProgressSpinner({}).start();
  spinner.update({ label: `Deleting ${log.white(Path.node_modules)}` });
  await fs.remove(Path.node_modules);
  spinner.stop();

  /**
   * Install.
   */
  if (args.install) {
    const cmd = 'yarn';
    const cwd = mode === 'make' ? Path.app : Path.root;
    spinner
      .update({ label: `running ${log.white(cmd)} (${log.green('install')}) in ${cwd}` })
      .start();
    const res = await exec.command(cmd).run({ silent: true, cwd });
    spinner.stop();

    if (!res.ok) {
      res.errors.forEach((err) => log.warn(err));
      return Logger.errorAndExit(res.code, `Failed while running "${cmd}"`);
    }

    log.info.gray(`cmd: ${cmd}`);
    log.info.gray(`dir: ${cwd}`);
  }
}
