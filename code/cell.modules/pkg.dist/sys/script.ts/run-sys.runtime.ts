import { DeployConfig, fs } from './common';
import { Util } from './Util';
import { deploy } from './Deploy.Vercel';

/**
 * DEPLOY
 */
(async () => {
  const dir = 'tmp/runtime';
  const name = 'cell-runtime';

  for (const item of DeployConfig.Runtime) {
    await fs.remove(dir);
    await fs.ensureDir(dir);

    // Copy static assets to root directory.
    if (item.copy) await Util.copyDir(item.copy, dir);

    // Prepare redirects JSON.
    await Util.saveConfig(dir, Util.toRewrites(item.rewrites));

    // Deploy
    const { team, project, alias } = item;
    await deploy({ dir, team, project, alias, name });
  }
})();
