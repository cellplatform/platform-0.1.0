import { t } from '../common';
import { compile } from './compile';

export type IPullArgs = Record<string, unknown>;

export const init: t.CmdPluginsInit = (cli) => {
  const handler: t.CmdPluginHandler<IPullArgs> = async (e) => {
    await compile({ dir: process.cwd() });
  };

  cli.command<IPullArgs>({
    name: 'compile',
    description: 'Compile cell-code',
    handler,
  });

  return cli;
};
