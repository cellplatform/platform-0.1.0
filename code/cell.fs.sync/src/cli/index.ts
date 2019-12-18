import { t } from '../common';
import * as cmd from './cmd.syncDir';

/**
 * Initialize the CLI.
 */
export const init: t.CliInit = cli => {
  type T = {
    force: string;
    silent: boolean;
    config: boolean;
    delete: boolean;
  };

  const syncDirHandler: t.CommandHandler<T> = async args => {
    await cmd.syncDir({
      dir: process.cwd(),
      silent: args.silent,
      config: args.config,
      delete: args.delete,
    });
  };

  cli
    .command<T>({
      name: 'syncdir',
      alias: 's',
      description: 'Synchronise a folder with the cloud.',
      handler: syncDirHandler,
    })
    .option<'boolean'>({
      name: 'delete',
      alias: 'd',
      description: 'Delete remote files that are no longer in the local folder',
      type: 'boolean',
      default: false,
    })
    .option<'boolean'>({
      name: 'silent',
      description: 'Suppress log output.',
      type: 'boolean',
      default: false,
    })
    .option<'boolean'>({
      name: 'config',
      alias: 'c',
      description: 'Force new configuration for the folder.',
      type: 'boolean',
      default: false,
    });

  return cli;
};
