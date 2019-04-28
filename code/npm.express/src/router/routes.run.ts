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
    const { name, downloadDir, prerelease, NPM_TOKEN } = await args.getContext();
    const result = await start({ name, downloadDir, prerelease, force, NPM_TOKEN });
    res.send(result);
  });

  /**
   * [POST] Stops the running service.
   */
  router.post('/stop', async (req, res) => {
    const { name, downloadDir, NPM_TOKEN } = await args.getContext();
    const result = await stop({ name, downloadDir, NPM_TOKEN });
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
  NPM_TOKEN?: string;
}) {
  const { name, downloadDir, prerelease, NPM_TOKEN } = args;
  const status = await getStatus({ name, downloadDir, prerelease, NPM_TOKEN });
  const { dir } = status;
  const process = getProcess(dir, NPM_TOKEN);

  // Monitor events.
  let actions: string[] = [];
  const monitor = monitorProcessEvents(process);

  const done = (args: { error?: t.INpmError }) => {
    monitor.stop();
    const { error } = args;
    const isRunning = process.isRunning;
    return { isRunning, ...status.info, actions, error };
  };

  // Ensure the module is installed.
  const isInstalled = await fs.pathExists(status.dir);
  if (!isInstalled) {
    const updated = await update({ name, downloadDir, prerelease, NPM_TOKEN });
    const { error } = updated;
    if (error) {
      actions = [...actions, `FAILED/on-install`];
      return done({ error });
    } else {
      actions = [...actions, `INSTALLED/${updated.version.latest}`];
    }
  }

  // Stop the process if necessary.
  await process.start({ force: args.force });
  actions = [...actions, ...monitor.actions];

  // Finish up.
  return done({});
}

/**
 * Stops the running service.
 */
export async function stop(args: { name: string; downloadDir: string; NPM_TOKEN?: string }) {
  const { name, downloadDir, NPM_TOKEN } = args;
  const dir = getDir(name, downloadDir);
  const process = getProcess(dir, NPM_TOKEN);
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
