import { t } from '../common';

/**
 * Initialize the CLI.
 */
export const init: t.CliInit = cli => {
  type T = {
    force: string;
  };

  cli
    .command<T>({
      name: 'syncdir',
      alias: 'sd',
      description: 'Synchronise a directory with the cloud.',
      async handler(args) {
        console.log('args >>>>>', args);
        console.log(__dirname);
        const dir = process.cwd();
        console.log('dir', dir);
        // args.
        return;
      },
    })
    .option<'string'>({
      name: 'force',
      alias: 'f',
      description: 'Do it man!',
      type: 'string',
      default: 'hello',
    });

  return cli;
};
