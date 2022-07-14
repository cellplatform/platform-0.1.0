import { fs, t } from './common';

export const Util = {
  /**
   * Convert a set of rewrite configurations to a [vercel.json] file.
   *
   * REF Schema:
   *    https://vercel.com/docs/project-configuration
   *
   */
  toVercelFile(config: t.DeployConfig): t.VercelConfigFile {
    const json: t.VercelConfigFile = {
      trailingSlash: true,
      redirects: [],
      rewrites: [],
    };

    const format = (path?: string) => {
      if (path?.startsWith('/')) path = `/${path.replace(/^\/*/, '')}`;
      return path ?? '';
    };

    if (config.rewrites) {
      config.rewrites.forEach((def) => {
        const source = def.match.replace(/^\/*/, '').replace(/\/*$/, '');
        const domain = new URL(def.use).origin;

        if (def.redirect) {
          json.redirects?.push({
            source: format(`/${source}`),
            destination: format(format(def.redirect)),
          });
        }

        json.rewrites?.push({
          source: format(`/${source}/`),
          destination: domain,
        });
        json.rewrites?.push({
          source: format(`/${source}/:match*`),
          destination: `${domain}/:match*`,
        });
      });
    }

    return json;
  },

  /**
   * Save a vercel config file.
   */
  async saveConfig(dir: string, config: t.VercelConfigFile) {
    const filepath = fs.join(dir, 'vercel.json');
    const json = JSON.stringify(config, null, '  ');
    dir = fs.resolve(dir);

    await fs.ensureDir(dir);
    await fs.writeFile(filepath, json);
  },

  /**
   * Copy a directory of files.
   */
  async copyDir(sourceDir: string, targetDir: string) {
    sourceDir = fs.resolve(sourceDir);
    targetDir = fs.resolve(targetDir);

    if (!(await fs.is.dir(sourceDir))) {
      throw new Error(`Directory does not exist. Path: "${sourceDir}"`);
    }

    const pattern = fs.join(sourceDir, `**`);
    const paths = (await fs.glob.find(pattern)).map((source) => {
      const path = source.substring(sourceDir.length);
      const target = fs.join(targetDir, path);
      return { source, target };
    });

    for (const item of paths) {
      await fs.copy(item.source, item.target);
    }
  },
};
