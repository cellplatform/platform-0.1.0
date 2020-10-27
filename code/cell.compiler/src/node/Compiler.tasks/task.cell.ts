import { defaultValue, fs, Model, parseUrl, t, Uri, PATH, logger } from '../common';
import { bundle } from './task.bundle';
import { upload } from './task.upload';

type B = t.CompilerModelBuilder;

/**
 * Cell compilation target.
 */
export const cell: t.CompilerCreateCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const parsedHost = parseUrl(hostInput);
  const host = parsedHost.host;

  const cell: t.CompilerCell = {
    host: `${parsedHost.protocol}//${parsedHost.host}`,
    uri,

    async bundle(config, options = {}) {
      const { silent } = options;
      return await bundle(config, { silent });
    },

    async upload(config, options = {}) {
      const { silent, targetDir } = options;
      const model = Model(config);
      const bundleDir = model.bundleDir;
      const targetCell = uri.toString();

      if (options.bundle || !(await fs.pathExists(bundleDir))) {
        await cell.bundle(config, { silent, targetDir });
      }

      if (!silent) {
        logger.hr();
      }

      const res = await upload({
        host,
        config: config.toObject(),
        targetCell,
        targetDir,
        silent,
      });

      return res;
    },
  };

  return cell;
};
