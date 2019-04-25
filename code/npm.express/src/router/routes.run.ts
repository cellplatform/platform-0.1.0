import { express, fs, getProcess, log, monitorProcessEvents, t } from '../common';
import { getDir, getStatus } from './routes.status';
import { update } from './routes.update';

export function create(args: { getContext: t.GetNpmRouteContext }) {
  const router = express.Router();

  /**
   * [POST] Starts the service.
   */
  router.post('/start', async (req, res) => {
    type BodyParams = {
      force?: boolean;
    };
    const { force } = req.body as BodyParams;
    const { name, downloadDir, prerelease } = await args.getContext();
    const result = await start({ name, downloadDir, prerelease, force });
    res.send(result);
  });

  /**
   * [POST] Stops the running service.
   */
  router.post('/stop', async (req, res) => {
    const { name, downloadDir } = await args.getContext();
    const result = await stop({ name, downloadDir });
    res.send(result);
  });

  // Finish up.
  return router;
}

/**
 * Starts the service.
 */
export async function start(args: {
  name: string;
  downloadDir: string;
  prerelease: t.NpmPrerelease;
  force?: boolean;
}) {
  const { name, downloadDir, prerelease } = args;
  const status = await getStatus({ name, downloadDir, prerelease });
  const { dir } = status;
  const process = getProcess(dir);

  // Monitor events.
  let actions: string[] = [];
  const monitor = monitorProcessEvents(process);

  // Ensure the module is installed.
  const isInstalled = await fs.pathExists(status.dir);
  if (!isInstalled) {
    const updated = await update({ name, downloadDir, prerelease });
    actions = [...actions, `INSTALLED/${updated.version.latest}`];
  }

  // Stop the process if necessary.
  await process.start({ force: args.force });
  actions = [...actions, ...monitor.actions];
  monitor.stop();

  // Finish up.
  const isRunning = process.isRunning;
  return { isRunning, ...status.info, actions };
}

/**
 * Stops the running service.
 */
export async function stop(args: { name: string; downloadDir: string }) {
  const { name, downloadDir } = args;
  const dir = getDir(name, downloadDir);
  const process = getProcess(dir);
  let actions: string[] = [];
  if (process.isRunning) {
    actions = [...actions, 'STOPPED'];
  }
  await process.stop();
  const isRunning = process.isRunning;
  log.info();
  log.info.gray(`😴 Stopped`);
  log.info();
  return { isRunning, name, actions };
}
