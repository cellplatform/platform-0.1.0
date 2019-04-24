import { exec, express, fs, log, monitorProcessEvents, NodeProcess, npm, t } from '../common';
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
    const body = req.body as BodyParams;
    const { dryRun, restart } = body;
    try {
      const { name, dir } = await args.getContext();
      const response = await update({ name, dir, dryRun, restart });
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
  dir: string;
  dryRun?: boolean;
  restart?: boolean;
}) {
  const { name, dir, dryRun, restart } = args;
  const status = await getStatus({ name, dir });
  const { version } = status;
  let actions: string[] = [];

  log.info();
  log.info.cyan('Update\n');
  log.info.gray(' - module:    ', log.white(name));
  log.info.gray(' - dir:       ', log.white(status.dir));
  log.info.gray(' - current:   ', log.white(version.current || '-'));
  log.info.gray(' - latest:    ', log.white(version.latest));
  log.info.gray(' - isChanged: ', log.white(version.isChanged));
  log.info();

  // Ensure package exists.
  if (!(await fs.pathExists(fs.join(dir, 'package.json')))) {
    await fs.ensureDir(dir);
    await exec.command('yarn init -y').run({ dir, silent: true });
    actions = [...actions, 'CREATED_PACKAGE'];
  }

  if (!dryRun && version.isChanged) {
    // Setup the installer package.
    const pkgAfter = npm.pkg(dir);
    pkgAfter.json.dependencies = pkgAfter.json.dependencies || {};
    pkgAfter.json.dependencies[name] = version.latest;
    await pkgAfter.save();

    // Pull the module from NPM.
    log.info.gray(`...installing...`);
    await npm.install({ use: 'YARN', dir, silent: true });
    actions = [...actions, `INSTALLED/${version.latest}`];
    log.info();
    log.info(`Installed ${log.yellow(`v${version.latest}`)} 🌼`);
    log.info();

    if (restart) {
      const process = NodeProcess.singleton({ dir: status.dir });
      const monitor = monitorProcessEvents(process);
      await process.start({ force: true });
      actions = [...actions, ...monitor.actions];
      monitor.stop();
    }
  }

  // Finish up.
  return { action: 'UPDATE', ...status, actions };
}
