import { express, fs, monitorProcessEvents, NodeProcess, t } from '../common';
import { getDir, getStatus } from './routes.status';
import { update } from './routes.update';

export function create(args: { getContext: t.GetNpmRouteContext }) {
  const router = express.Router();

  /**
   * [POST] Updates the module to the latest version.
   */
  router.post('/start', async (req, res) => {
    type BodyParams = {
      force?: boolean;
    };

    // Setup initial conditions.
    const body = req.body as BodyParams;
    const context = await args.getContext();
    const { name } = context;
    const status = await getStatus({ name, dir: context.dir });
    const process = NodeProcess.singleton({ dir: status.dir });

    // Monitor events.
    let actions: string[] = [];
    const monitor = monitorProcessEvents(process);

    // Ensure the module is installed.
    const isInstalled = await fs.pathExists(status.dir);
    if (!isInstalled) {
      const updated = await update({ name, dir: context.dir });
      actions = [...actions, `INSTALLED/${updated.version.latest}`];
    }

    // Stop the process if necessary.
    await process.start({ force: body.force });
    actions = [...actions, ...monitor.actions];
    monitor.stop();

    // Finish up.
    res.send({ action: 'START', ...status, isRunning: process.isRunning, actions });
  });

  /**
   * [POST] Stops the running service
   */
  router.post('/stop', async (req, res) => {
    const context = await args.getContext();
    const { name } = context;
    const dir = getDir(name, context.dir);
    const process = NodeProcess.singleton({ dir });
    let actions: string[] = [];
    if (process.isRunning) {
      actions = [...actions, 'STOPPED'];
    }
    await process.stop();
    res.send({ action: 'STOP', name, isRunning: process.isRunning, actions });
  });

  // Finish up.
  return router;
}
