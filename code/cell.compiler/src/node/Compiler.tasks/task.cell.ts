import { defaultValue, fs, Model, parseUrl, t, Uri, PATH } from '../common';
import { bundle } from './task.bundle';
import { logger } from './util';
import { upload } from './task.upload';

type B = t.CompilerModelBuilder;

/**
 * Cell compilation target.
 */
export const cell: t.CompilerCreateCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const urn = uri.toString().replace(/\:/g, '-');
  const baseDir = fs.join(PATH.cachedir, urn);

  const parsedHost = parseUrl(hostInput);
  const host = parsedHost.host;

  const exists = (config: B) => fs.pathExists(cell.dir(config));

  const cell: t.CompilerCell = {
    host: `${parsedHost.protocol}//${parsedHost.host}`,
    uri,
    dir(config) {
      const model = Model(config);
      const target = model.target('web').join();
      return fs.join(baseDir, target, `${model.name()}`);
    },

    async bundle(config, options = {}) {
      const { silent } = options;
      const uploadConfig = config.clone().dir(cell.dir(config));
      return await bundle(uploadConfig, { silent });
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
      const res = await upload({
        host,
        config: config.toObject(),
        sourceDir,
        targetCell,
        targetDir,
        silent,
      });

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
