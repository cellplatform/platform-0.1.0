import { t } from '../common';
import { dirPull } from './dirPull';

export type IPullArgs = {};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<IPullArgs> = async e => {
    const { argv } = e;
    await dirPull({
      dir: process.cwd(),
    });
  };

  cli.command<IPullArgs>({
    name: 'dir-pull',
    description: 'Pull folder from remote',
    handler,
  });

  return cli;
};
