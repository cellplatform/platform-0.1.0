import { exec } from '../common';

/**
 * Retrieves the installed version of [yarn].
 * Use this to determine if yarn is installed.
 */
export async function getVersion() {
  try {
    const cmd = `node --version`;
    const res = await exec.cmd.run(cmd, { silent: true });
    let version = res.code === 0 ? res.info[0] : undefined;
    version = version ? version.replace(/^v/, '') : undefined;
    return version;
  } catch (error) {
    return undefined; // Not installed.
  }
}
