import { express, fs, NodeProcess, npm, t } from '../common';

export function create(args: { getContext: t.GetNpmRouteContext }) {
  const router = express.Router();

  /**
   * [POST] Updates the module to the latest version.
   */
  router.post('/status', async (req, res) => {
    try {
      const context = await args.getContext();
      const { name } = context;
      const status = await getStatus({ name, dir: context.dir });
      const process = NodeProcess.singleton({ dir: status.dir });
      res.send({ ...status, isRunning: process.isRunning });
    } catch (error) {
      res.send({ status: 500, error: error.message });
    }
  });

  // Finish up.
  return router;
}

/**
 * Retrieves status details
 */
export async function getStatus(args: { name: string; dir: string }) {
  const { name } = args;
  const dir = getDir(name, args.dir);
  const pkg = npm.pkg(dir);
  const latest = (await npm.getVersion(name)) || '-';
  const current = pkg.version || '-';
  const isChanged = current !== latest;
  const version = {
    current,
    latest,
    isChanged,
  };
  return { name, version, dir };
}

/**
 * Retrieve the path to the given module.
 */
export function getDir(name: string, rootDir: string) {
  return fs.join(rootDir, 'node_modules', name);
}
