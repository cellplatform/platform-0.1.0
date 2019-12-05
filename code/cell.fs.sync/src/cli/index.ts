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
      name: 'foobar',
      alias: 'fb',
      description: 'My foobar thing yoooo',
      async handler(args) {
        console.log('args >>>>>', args);
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
