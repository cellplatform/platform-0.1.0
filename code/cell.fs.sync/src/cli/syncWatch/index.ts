import { t } from '../common';
import { syncWatch } from './syncWatch';

export type ISyncWatchArgs = {};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<ISyncWatchArgs> = async e => {
    const { argv, keyboard } = e;
    await syncWatch({
      dir: process.cwd(),
      keyboard,
    });
  };

  cli.command<ISyncWatchArgs>({
    name: 'syncWatch',
    alias: 'w',
    description: 'Synchronise folder in watch mode',
    handler,
  });

  return cli;
};
