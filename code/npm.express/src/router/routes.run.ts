import { express, fs, monitorProcessEvents, NodeProcess, t } from '../common';
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
    const body = req.body as BodyParams;
    const { name, dir } = await args.getContext();
    const result = await start({ name, dir, force: body.force });
    res.send(result);
  });

  /**
   * [POST] Stops the running service.
   */
  router.post('/stop', async (req, res) => {
    const { name, dir } = await args.getContext();
    const result = await stop({ name, dir });
    res.send(result);
  });

  // Finish up.
  return router;
}

/**
 * Starts the service.
 */
export async function start(args: { name: string; dir: string; force?: boolean }) {
  const { name } = args;
  const status = await getStatus({ name, dir: args.dir });
  const process = NodeProcess.singleton({ dir: status.dir });

  // Monitor events.
  let actions: string[] = [];
  const monitor = monitorProcessEvents(process);

  // Ensure the module is installed.
  const isInstalled = await fs.pathExists(status.dir);
  if (!isInstalled) {
    const updated = await update({ name, dir: args.dir });
    actions = [...actions, `INSTALLED/${updated.version.latest}`];
  }

  // Stop the process if necessary.
  await process.start({ force: args.force });
  actions = [...actions, ...monitor.actions];
  monitor.stop();

  // Finish up.
  return { ...status, isRunning: process.isRunning, actions };
}

/**
 * Stops the running service.
 */
export async function stop(args: { name: string; dir: string }) {
  const { name } = args;
  const dir = getDir(name, args.dir);
  const process = NodeProcess.singleton({ dir });
  let actions: string[] = [];
  if (process.isRunning) {
    actions = [...actions, 'STOPPED'];
  }
  await process.stop();
  return { name, isRunning: process.isRunning, actions };
}
