import { t } from '../common';
import { dirWatch } from './dirWatch';

export type ISyncWatchArgs = {};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<ISyncWatchArgs> = async e => {
    const { argv, keyboard } = e;
    await dirWatch({
      dir: process.cwd(),
      keyboard,
    });
  };

  cli.command<ISyncWatchArgs>({
    name: 'dir-watch',
    alias: 'w',
    description: 'Synchronise folder in watch mode',
    handler,
  });

  return cli;
};
