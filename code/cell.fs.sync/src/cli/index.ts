import { t } from '../common';
import * as cmd from './cmd.syncDir';

/**
 * Initialize the CLI.
 */
export const init: t.CliInit = cli => {
  type T = {
    force: string;
    dry: boolean;
    silent: boolean;
    config: boolean;
  };

  const syncDirHandler: t.CommandHandler<T> = async args => {
    const dir = process.cwd();
    const dryRun = args.dry;
    const silent = args.silent;
    const config = args.config;
    await cmd.syncDir({ dir, dryRun, silent, config });
  };

  cli
    .command<T>({
      name: 'syncdir',
      alias: 's',
      description: 'Synchronise a directory with the cloud.',
      handler: syncDirHandler,
    })
    .option<'boolean'>({
      name: 'dry',
      alias: 'd',
      description: 'Dry run without executing against service.',
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
      description: 'Force new configuration for the directory.',
      type: 'boolean',
      default: false,
    });

  return cli;
};
