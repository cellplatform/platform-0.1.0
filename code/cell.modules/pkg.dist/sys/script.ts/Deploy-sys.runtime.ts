import { DeployConfig, fs, log } from './common';
import { Util } from './Util';
import { deploy } from './Deploy.Vercel';

/**
 * DEPLOY
 */
export default async () => {
  const dir = 'dist/sys.runtime';
  const name = 'cell-runtime';

  log.info();
  log.info.gray(`Deploy: ${log.white('sys.libs')}`);
  log.info.gray(`  dist: ${dir}`);
  log.info();

  for (const config of DeployConfig.Runtime) {
    log.info.gray(`• ${log.white(config.alias)}`);

    await fs.remove(dir);
    await fs.ensureDir(dir);

    // Copy static assets to root directory.
    if (config.copyStatic) await Util.mergeDirectory(config.copyStatic, dir, { log: true });

    // Prepare redirects JSON.
    const vercelFile = Util.toVercelFile(config);
    await Util.saveConfig(dir, vercelFile);

    // Deploy.
    const { team, project, alias } = config;
    await deploy({ dir, team, project, alias, name });

    // Finish up.
    log.info();
  }
};
