import {
  exec,
  express,
  fs,
  getProcess,
  log,
  monitorProcessEvents,
  npm,
  semver,
  t,
  value,
} from '../common';
import { getStatus } from './routes.status';

export function create(args: { getContext: t.GetNpmRouteContext }) {
  const router = express.Router();

  /**
   * [POST] Updates the module to the latest version.
   */
  router.post('/update', async (req, res) => {
    type BodyParams = {
      dryRun?: boolean;
      restart?: boolean;
      version?: string | 'latest';
      prerelease?: t.NpmPrerelease;
      reset?: boolean;
    };

    const body = req.body as BodyParams;
    const { dryRun, restart, version, reset } = body;

    try {
      const context = await args.getContext();
      const { name, downloadDir, NPM_TOKEN } = context;
      const prerelease = body.prerelease === undefined ? context.prerelease : body.prerelease;
      const response = await update({
        name,
        downloadDir,
        prerelease,
        dryRun,
        restart,
        version,
        reset,
        NPM_TOKEN,
      });
      res.send(response);
    } catch (error) {
      res.send({ status: 500, error: error.message });
    }
  });

  // Finish up.
  return router;
}

/**
 * Updates the module to the latest version.
 */
export async function update(args: {
  name: string;
  downloadDir: string;
  prerelease: t.NpmPrerelease;
  dryRun?: boolean;
  restart?: boolean;
  version?: string | 'latest';
  reset?: boolean;
  NPM_TOKEN?: string;
}) {
  // Setup initial conditions.
  let actions: string[] = [];
  const { name, downloadDir, dryRun, prerelease = false, NPM_TOKEN } = args;
  const restart = value.defaultValue(args.restart, true);
  const status = await getStatus({ name, downloadDir, prerelease, NPM_TOKEN });
  const { info, dir: moduleDir } = status;

  // Retrieve version information.
  const { version } = info;
  let wanted = args.version || version.latest;
  wanted = wanted.toLowerCase() === 'latest' ? version.latest : wanted;
  const notFound = !semver.isValid(wanted);
  let isChanged = notFound ? false : !semver.eq(version.current, wanted);

  const done = async (args: { error?: t.INpmError }) => {
    const { error } = args;
    return { ...status.info, actions, error };
  };

  const start = async () => {
    try {
      const process = getProcess(moduleDir, NPM_TOKEN);

      const monitor = monitorProcessEvents(process);
      await process.start({ force: true });
      actions = [...actions, ...monitor.actions];
      monitor.stop();
    } catch (error) {
      log.error(`Failed while starting service. ${error.message}`);
    }
  };

  log.info();
  log.info.cyan('Update\n');
  log.info.gray('    - module:    ', log.magenta(name));
  log.info.gray('    - dir:       ', log.white(moduleDir));
  log.info.gray('    - prerelease:', log.white(prerelease));
  log.info.gray('    - token:     ', Boolean(NPM_TOKEN));
  log.info.gray('    - current:   ', log.white(version.current || '-'));
  log.info.gray('    - latest:    ', log.white(version.latest));
  log.info.gray('    - wanted:    ', log.yellow(wanted), !isChanged ? log.yellow('(latest)') : '');

  const statusInfo = notFound
    ? log.red('404 Not Found')
    : isChanged || args.reset
    ? log.green(args.reset ? 'RESET' : 'INSTALL REQUIRED')
    : log.gray('NO CHANGE');
  log.info.gray('    - status:    ', statusInfo);
  log.info();

  // Ensure a module version exists to install.
  if (notFound) {
    actions = [...actions, `FAIL/404`];

    log.info('✋');
    log.info.yellow(`    The module ${log.red(name)} was not found on NPM.`);
    log.info.yellow('    HINT: If the module is private ensure you have an NPM_TOKEN configured.');
    log.info();

    const message = `The module '${name}' was not be found on NPM.`;
    return done({ error: { status: 404, message } });
  }

  if (!isChanged && !args.reset) {
    log.info.yellow(`👌  Already up-to-date.`);
  }

  // Delete the existing folder first if requested.
  if (!dryRun && args.reset && (await fs.pathExists(downloadDir))) {
    await fs.remove(downloadDir);
    await fs.ensureDir(downloadDir);
    actions = [...actions, `DELETED/existing-download`];
    log.info.gray(`\nExisting download deleted\n`);
    isChanged = true;
  }

  // Ensure package exists.
  if (!(await fs.pathExists(fs.join(downloadDir, 'package.json')))) {
    await exec.command('yarn init -y').run({ cwd: downloadDir, silent: true });
    actions = [...actions, 'CREATED_PACKAGE'];
  }

  if (dryRun && isChanged) {
    log.info.gray(`Dry run...no changes made.\n`);
  }

  if (!dryRun && isChanged) {
    try {
      // Setup the installer package.
      const pkg = npm.pkg(downloadDir);
      pkg.json.dependencies = pkg.json.dependencies || {};
      pkg.json.dependencies[name] = wanted;
      await pkg.save();

      // Pull the module from NPM.
      log.info.gray(`...installing...`);
      await npm.install({ use: 'YARN', dir: downloadDir, silent: true, NPM_TOKEN });
      actions = [...actions, `INSTALLED/${wanted}`];
      log.info();
      log.info(`Installed ${log.yellow(`v${wanted}`)} 🌼`);
      log.info();

      if (restart) {
        await start();
      }
    } catch (error) {
      const message = `Failed while installing '${name}'.`;
      log.error(message);
      return done({ error: { status: 500, message } });
    }
  }

  if (!dryRun && !isChanged && restart) {
    await start();
  }

  // Finish up.
  return done({});
}
