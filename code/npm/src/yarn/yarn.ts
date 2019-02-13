import { exec } from '../common';

/**
 * Retrieves the installed version of [yarn].
 * Use this to determine if yarn is installed.
 */
export async function getVersion() {
  try {
    const cmd = `yarn --version`;
    const res = await exec.run(cmd, { silent: true });
    return res.code === 0 ? res.info[0] : undefined;
  } catch (error) {
    return undefined; // Not installed.
  }
}

/**
 * Determines whether [yarn] is installed
 */
export async function isInstalled() {
  return Boolean(await getVersion());
}
