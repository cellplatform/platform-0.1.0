import { exec, express, fs, getProcess, log, monitorProcessEvents, npm, t } from '../common';
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
    };
    const { dryRun, restart } = req.body as BodyParams;
    try {
      const { name, downloadDir, prerelease } = await args.getContext();
      const response = await update({ name, downloadDir, prerelease, dryRun, restart });
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
}) {
  const { name, downloadDir, dryRun, restart, prerelease } = args;
  const status = await getStatus({ name, downloadDir, prerelease });
  const { info, dir: moduleDir } = status;
  const { version } = info;

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
  log.info.gray(' - module:    ', log.white(name));
  log.info.gray(' - dir:       ', log.white(moduleDir));
  log.info.gray(' - current:   ', log.white(version.current || '-'));
  log.info.gray(' - latest:    ', log.white(version.latest));
  log.info.gray(' - isChanged: ', log.white(status.isChanged));
  log.info();

  if (!status.isChanged) {
    log.info.yellow(`👌  Already up-to-date.`);
  }

  // Ensure package exists.
  if (!(await fs.pathExists(fs.join(downloadDir, 'package.json')))) {
    await fs.ensureDir(downloadDir);
    await exec.command('yarn init -y').run({ dir: downloadDir, silent: true });
    actions = [...actions, 'CREATED_PACKAGE'];
  }

  if (!dryRun && status.isChanged) {
    // Setup the installer package.
    const pkg = npm.pkg(downloadDir);
    pkg.json.dependencies = pkg.json.dependencies || {};
    pkg.json.dependencies[name] = version.latest;
    await pkg.save();

    // Pull the module from NPM.
    log.info.gray(`...installing...`);
    await npm.install({ use: 'YARN', dir: downloadDir, silent: true });
    actions = [...actions, `INSTALLED/${version.latest}`];
    log.info();
    log.info(`Installed ${log.yellow(`v${version.latest}`)} 🌼`);
    log.info();

    if (restart) {
      await start();
    }
  }

  if (!dryRun && !status.isChanged && restart) {
    await start();
  }

  // Finish up.
  return { ...status.info, actions };
}
