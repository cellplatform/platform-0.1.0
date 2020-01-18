import { t, log } from './libs';

export type IMyArgs = {
  force: boolean;
};

/**
 * Simple plugin configuration.
 */
export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<IMyArgs> = async args => {
    log.info();
    log.info('plugin handler 🌳');
    log.info('  argv', args.argv);
    log.info();
  };

  cli
    .command<IMyArgs>({
      name: 'plugin',
      alias: 'p',
      description: 'A command inserted via plugins',
      handler,
    })
    .option<'boolean'>({
      name: 'force',
      alias: 'f',
      description: 'Force something',
      type: 'boolean',
      default: false,
    });
};
