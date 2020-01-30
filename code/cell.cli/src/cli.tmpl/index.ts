import { t } from '../common';
import { tmpl } from './tmpl';

export type ITmplArgs = {};

/**
 * Initialize Template command-line-interface (CLI).
 */
export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<ITmplArgs> = async e => {
    await tmpl({
      dir: process.cwd(),
    });
  };

  cli.command<ITmplArgs>({
    name: 'tmpl',
    description: 'Create from template.',
    handler,
  });

  return cli;
};
