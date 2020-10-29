import { logger, parseUrl, t, Uri } from '../common';
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
    env: { host: string; cell: string; dir?: string };
    silent?: boolean;
  }) => {
    const { env, silent } = args;
    const config = args.config.clone().env({ bundle: env });
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
      const env = { host, cell: targetCell, dir: targetDir };
      await runBundle({ config, env, silent });

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
