import {
  exec,
  express,
  fs,
  getProcess,
  log,
  monitorProcessEvents,
  npm,
  t,
  semver,
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
    };

    const body = req.body as BodyParams;
    const { dryRun, restart, version } = body;
    try {
      const context = await args.getContext();
      const { name, downloadDir } = context;
      const prerelease = body.prerelease === undefined ? context.prerelease : body.prerelease;
      const response = await update({ name, downloadDir, prerelease, dryRun, restart, version });
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
  dryRun?: boolean;
  restart?: boolean;
  version?: string | 'latest';
  prerelease: t.NpmPrerelease;
}) {
  const { name, downloadDir, dryRun, restart, prerelease } = args;
  const status = await getStatus({ name, downloadDir, prerelease });
  const { info, dir: moduleDir } = status;
  const { version } = info;
  let wanted = args.version || version.latest;
  wanted = wanted.toLowerCase() === 'latest' ? version.latest : wanted;
  const isChanged = !semver.eq(version.current, wanted);

  let actions: string[] = [];
  const start = async () => {
    const process = getProcess(moduleDir);
    const monitor = monitorProcessEvents(process);
    await process.start({ force: true });
    actions = [...actions, ...monitor.actions];
    monitor.stop();
  };

  log.info();
  log.info.cyan('Update\n');
  log.info.gray('    - module:    ', log.magenta(name));
  log.info.gray('    - dir:       ', log.white(moduleDir));
  log.info.gray('    - prerelease:', log.white(prerelease));
  log.info.gray('    - current:   ', log.white(version.current || '-'));
  log.info.gray('    - latest:    ', log.white(version.latest));
  log.info.gray('    - wanted:    ', log.yellow(wanted), !isChanged ? log.yellow(' (latest)') : '');

  const statusInfo = isChanged ? log.cyan('UPDATE REQUIRED') : log.gray('NO CHANGE');
  log.info.gray(' - status:     ', statusInfo);
  log.info();

  if (!isChanged) {
    log.info.yellow(`👌  Already up-to-date.`);
  }

  // Ensure package exists.
  if (!(await fs.pathExists(fs.join(downloadDir, 'package.json')))) {
    await fs.ensureDir(downloadDir);
    await exec.command('yarn init -y').run({ dir: downloadDir, silent: true });
    actions = [...actions, 'CREATED_PACKAGE'];
  }

  if (dryRun && isChanged) {
    log.info.gray(`Dry run...no changes made.\n`);
  }

  if (!dryRun && isChanged) {
    // Setup the installer package.
    const pkg = npm.pkg(downloadDir);
    pkg.json.dependencies = pkg.json.dependencies || {};
    pkg.json.dependencies[name] = wanted;
    await pkg.save();

    // Pull the module from NPM.
    log.info.gray(`...installing...`);
    await npm.install({ use: 'YARN', dir: downloadDir, silent: true });
    actions = [...actions, `INSTALLED/${wanted}`];
    log.info();
    log.info(`Installed ${log.yellow(`v${wanted}`)} 🌼`);
    log.info();

    if (restart) {
      await start();
    }
  }

  if (!dryRun && !isChanged && restart) {
    await start();
  }

  // Finish up.
  return { ...status.info, actions };
}
