import { fs, t, parseHostUrl, Uri, logger, defaultValue } from '../common';
import { wp } from '../config.wp';
import { bundle } from './Compiler.bundle';
import { upload } from './Compiler.upload';

type M = t.WebpackModel | t.ConfigBuilderChain;
type B = t.ConfigBuilderChain;

/**
 * Cell compilation target.
 */
export const cell: t.WebpackCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const urn = uri.toString().replace(/\:/g, '-');

  const parsedHost = parseHostUrl(hostInput);
  const host = parsedHost.toString({ port: true });
  const baseDir = fs.join(fs.resolve('./node_modules/.cache/cell'), urn);

  const exists = (config: B) => fs.pathExists(cell.dir(config));

  const cell: t.WebpackCellCompiler = {
    host,
    uri,
    dir(config) {
      const model = config.toObject();
      const target = wp.toTargetArray(model, 'web').join(',');
      return fs.join(baseDir, target, `${model.name}-${model.mode}`);
    },

    async bundle(config, options = {}) {
      const { silent } = options;
      const dir = cell.dir(config);
      return await bundle(config.clone().dir(dir), { silent });
    },

    async upload(config, options = {}) {
      const { silent, force } = options;

      if (force || !(await exists(config))) {
        await cell.bundle(config, { silent });
      }

      if (!silent) {
        logger.hr();
      }

      // TODO 🐷 - targetDir
      const sourceDir = cell.dir(config);
      const targetCell = uri.toString();
      const res = await upload({ host, sourceDir, targetCell, silent });

      if (defaultValue(options.cleanAfter, true)) {
        await cell.clean(config);
      }

      return res;
    },

    async clean(config) {
      const path = config ? cell.dir(config) : baseDir;
      await fs.remove(path);
    },
  };

  return cell;
};
