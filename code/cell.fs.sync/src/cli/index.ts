import { t } from '../common';
import * as cmd from './cmd';

/**
 * Initialize the CLI.
 */
export const init: t.CliInit = cli => {
  type T = {
    force: string;
    dry: boolean;
  };

  const syncDirHandler: t.CommandHandler<T> = async args => {
    const dir = process.cwd();
    const dryRun = args.dry;
    await cmd.syncDir({ dir, dryRun });
  };

  cli
    .command<T>({
      name: 'syncdir',
      alias: 'sd',
      description: 'Synchronise a directory with the cloud.',
      handler: syncDirHandler,
    })
    .option<'boolean'>({
      name: 'dry',
      alias: 'd',
      description: 'Dry run without executing against service.',
      type: 'boolean',
      default: false,
    });

  return cli;
};
