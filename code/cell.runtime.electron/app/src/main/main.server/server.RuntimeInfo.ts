import { app as electron } from 'electron';
import { ENV, log, t } from '../common';

/**
 * Derive the runtime info for the electron application.
 * NOTE:
 *    This is extra information about the application runtime that is
 *    appended to the on the system-info route.
 */
export async function RuntimeInfo(args: { paths: t.ElectronDataPaths }) {
  const { paths } = args;
  const env = process.env.NODE_ENV as t.ElectronRuntimeInfo['env'];
  const versions = process.versions;

  const info: t.ElectronRuntimeInfo = {
    type: 'cell.runtime.electron',
    version: ENV.pkg.version,
    packaged: electron.isPackaged,
    env,
    paths: {
      db: paths.db,
      fs: paths.fs,
      config: paths.config,
      log: paths.log,
    },
    versions: {
      node: versions.node,
      electron: versions.electron,
      chrome: versions.chrome,
      v8: versions.v8,
    },
  };

  return info;
}
