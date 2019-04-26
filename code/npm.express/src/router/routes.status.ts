import { express, fs, getProcess, npm, t } from '../common';

export function create(args: { getContext: t.GetNpmRouteContext }) {
  const router = express.Router();

  /**
   * [POST] Updates the module to the latest version.
   */
  router.get('/status', async (req, res) => {
    try {
      const context = await args.getContext();
      const { name, downloadDir, prerelease } = context;
      const { info, dir, isChanged } = await getStatus({ name, downloadDir, prerelease });
      const process = getProcess(dir);
      const isRunning = process.isRunning;
      const status = isChanged ? 'UPDATE_PENDING' : 'LATEST';

      res.send({ isRunning, status, ...info });
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
export async function getStatus(args: {
  name: string;
  downloadDir: string;
  prerelease: t.NpmPrerelease;
}) {
  const { name, downloadDir, prerelease } = args;
  const dir = getDir(name, downloadDir);
  const pkg = npm.pkg(dir);
  const latest = (await npm.getVersion(name, { prerelease })) || '-';
  const current = pkg.version || '-';
  const isChanged = current !== latest;
  const version = {
    current,
    latest,
  };
  const info = { name, version };
  return { info, dir, isChanged };
}

/**
 * Retrieve the path to the given module.
 */
export function getDir(name: string, downloadDir: string) {
  return fs.join(downloadDir, 'node_modules', name);
}
