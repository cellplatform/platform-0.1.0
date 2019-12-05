import { t } from './common';
import { cli } from '@platform/cli';

/**
 * Initializes a new "command-line-interface" application.
 */
export function init(): t.ICliApp {
  const app = cli.create('cell');

  const api: t.ICliApp = {
    commands: [],

    /**
     * Add a command to the application.
     */
    command(args: t.ICliCommandArgs) {
      const { name, description, alias } = args;

      const id = [name, alias].filter(value => Boolean(value)) as string[];
      app.command(id, description, yargs => {
        res.options.forEach(args => {
          yargs.option(name, {
            alias: args.alias,
            describe: args.description,
            type: args.type,
            default: args.default,
          });
        });
        return yargs;
      });

      const cmd: t.ICliCommand = {
        name,
        description,
        alias,
        options: [],
      };

      const res: t.ICliCommandResponse = {
        ...cmd,
        option<T extends keyof t.ICliOptionType>(args: t.ICliOption<T>) {
          cmd.options = [...cmd.options, args];
          return res;
        },
      };

      // Finish up.
      api.commands = [...api.commands, cmd];
      return res;
    },

    /**
     * Run the application.
     */
    run() {
      return app.run();
    },
  };

  // Finish up.
  return api;
}
