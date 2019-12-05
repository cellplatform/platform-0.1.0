import { t } from '../common';

/**
 * Initialize the CLI.
 */
export const init: t.CliInit = cli => {
  cli
    .command({
      name: 'foobar',
      alias: 'ff',
      description: 'My foobar thing yoooo',
    })
    .option<'string'>({
      name: 'force',
      description: 'Do it man!',
      type: 'string',
      default: 'hello',
    });

  return cli;
};
