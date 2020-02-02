import { t } from '../common';
import { compile } from './compile';

export type IPullArgs = {};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<IPullArgs> = async e => {
    const { argv } = e;
    await compile({
      dir: process.cwd(),
    });
  };

  cli.command<IPullArgs>({
    name: 'compile-wasm',
    description: 'Compile cell-code',
    handler,
  });

  return cli;
};
