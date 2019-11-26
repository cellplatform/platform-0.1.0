import { cli, fs, log, util } from './common';
import { getConfigFiles, logNoConfigFiles } from './cmd.list';

/**
 * Run a deployment.
 */
export async function run() {
  // Read in the config files.
  const files = await getConfigFiles();
  const dir = files.dir;

  // Ensure there is at least one configuration file.
  if (files.isEmpty) {
    return logNoConfigFiles({ dir });
  }

  // Prompt the user for which deployment to run.
  const path = await files.prompt();

  console.log('-------------------------------------------');
  console.log('res', path);
}
