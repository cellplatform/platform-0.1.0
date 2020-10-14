import { fs, t, Uri, logger, defaultValue, Model, parseUrl, Schema } from '../common';
import { bundle } from './Compiler.bundle';
import { upload } from './Compiler.upload';

type B = t.ConfigBuilderChain;

/**
 * Cell compilation target.
 */
export const cell: t.WebpackCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const urn = uri.toString().replace(/\:/g, '-');
  const baseDir = fs.join(fs.resolve('./node_modules/.cache/cell'), urn);

  const parsedHost = parseUrl(hostInput);
  const host = parsedHost.host;

  const exists = (config: B) => fs.pathExists(cell.dir(config));
  const toUrl = (targetDir?: string) => {
    const url = `${host}${Schema.urls(host).cell(uri).file.toString()}`;
    return targetDir ? `${url}${targetDir}` : url;
  };

  const cell: t.WebpackCellCompiler = {
    host,
    uri,
    dir(config) {
      const model = Model(config);
      const target = model.target('web').join();
      return fs.join(baseDir, target, `${model.name()}-${model.mode()}`);
    },

    async bundle(config, options = {}) {
      const { silent, targetDir } = options;
      const upload = config.clone().dir(cell.dir(config)).url(toUrl(targetDir));
      return await bundle(upload, { silent });
    },

    async upload(config, options = {}) {
      const { silent, force, targetDir } = options;

      if (force || !(await exists(config))) {
        await cell.bundle(config, { silent, targetDir });
      }

      if (!silent) {
        logger.hr();
      }

      const sourceDir = cell.dir(config);
      const targetCell = uri.toString();
      const res = await upload({ host, sourceDir, targetCell, targetDir, silent });

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
