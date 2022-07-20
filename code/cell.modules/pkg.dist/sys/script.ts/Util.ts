import { log, fs, t } from './common';

type DirPath = string;

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
            destination: format(def.redirect),
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

    json.redirects?.push({
      source: `/favicon.ico`,
      destination: `/static/favicon.ico`,
    });

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
  async mergeDirectory(source: DirPath, target: DirPath, options: { log?: boolean } = {}) {
    const sourceDir = fs.resolve(source);
    const targetDir = fs.resolve(target);

    if (options.log) {
      log.info.gray(`  • from: ${sourceDir}`);
      log.info.gray(`  • to:   ${targetDir}`);
    }

    if (!(await fs.is.dir(sourceDir))) {
      throw new Error(`Directory does not exist. Path: "${sourceDir}"`);
    }

    const paths = (await fs.glob.find(fs.join(sourceDir, `**`))).map((source) => {
      const path = source.substring(sourceDir.length);
      return { source, target: fs.join(targetDir, path) };
    });

    for (const item of paths) {
      log.info.gray(`          • ${fs.basename(item.target.substring(targetDir.length))}`);
      await fs.copy(item.source, item.target);
    }

    return paths;
  },
};
