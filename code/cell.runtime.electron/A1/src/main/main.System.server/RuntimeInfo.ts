import { app as electron } from 'electron';
import { ENV, t } from '../common';

/**
 * Derive the runtime info for the electron application.
 * NOTE:
 *    This is extra information about the application runtime that is
 *    appended to the on the system-info route.
 */
export function RuntimeInfo(args: { paths: t.ElectronDataPaths }) {
  const { paths } = args;
  const env = process.env.NODE_ENV as t.ElectronRuntimeInfo['env'];
  const versions = process.versions;

  const info: t.ElectronRuntimeInfo = {
    type: ENV.pkg.name,
    version: ENV.pkg.version,
    packaged: electron?.isPackaged ?? false,
    env,
    paths,
    versions: {
      node: versions.node,
      electron: versions.electron,
      chrome: versions.chrome,
      v8: versions.v8,
    },
  };

  return info;
}
