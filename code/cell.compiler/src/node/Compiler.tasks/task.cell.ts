import { logger, parseUrl, t, Uri, defaultValue } from '../common';
import { bundle } from './task.bundle';
import { upload } from './task.cell.upload';

type B = t.CompilerModelBuilder;

/**
 * Cell compilation target.
 */
export const cell: t.CompilerCreateCell = (hostInput, cellInput) => {
  const uri = typeof cellInput === 'object' ? cellInput : Uri.cell(cellInput);
  const parsedHost = parseUrl(hostInput);
  const host = parsedHost.host;

  const runBundle = async (args: {
    config: B;
    origin: t.RuntimeBundleOrigin;
    silent?: boolean;
  }) => {
    const { origin, silent } = args;
    const config = args.config.clone().env({ origin });
    return await bundle(config, { silent });
  };

  const cell: t.CompilerCell = {
    host: `${parsedHost.protocol}//${parsedHost.host}`,
    uri,

    async upload(config, options = {}) {
      const { silent, targetDir } = options;
      const targetCell = uri.toString();

      /**
       * [1] Bundle the code.
       */
      const origin: t.RuntimeBundleOrigin = { host, cell: targetCell, dir: targetDir };
      if (defaultValue(options.bundle, true)) {
        await runBundle({ config, origin, silent });
      }

      if (!silent) {
        logger.hr();
      }

      /**
       * [2] Upload to remote server.
       */
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
