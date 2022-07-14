import { DeployConfig, fs } from './common';
import { Util } from './Util';
import { deploy } from './Deploy.Vercel';

/**
 * DEPLOY
 */
export default async () => {
  const dir = 'tmp/runtime';
  const name = 'cell-runtime';

  for (const config of DeployConfig.Runtime) {
    await fs.remove(dir);
    await fs.ensureDir(dir);

    // Copy static assets to root directory.
    if (config.copyStatic) await Util.mergeDirectory(config.copyStatic, dir);

    // Prepare redirects JSON.
    await Util.saveConfig(dir, Util.toVercelFile(config));

    // Deploy
    const { team, project, alias } = config;
    await deploy({ dir, team, project, alias, name });
  }
};
