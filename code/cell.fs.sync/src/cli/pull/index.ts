import { t } from '../common';
import { pull } from './pull';

export type IPullArgs = {};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<IPullArgs> = async e => {
    const { argv } = e;
    await pull({
      dir: process.cwd(),
    });
  };

  cli.command<IPullArgs>({
    name: 'pull',
    description: 'Pull folder from remote',
    handler,
  });

  return cli;
};
