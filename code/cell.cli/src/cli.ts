import { t, defaultValue } from './common';
import { cli } from '@platform/cli';

/**
 * Initializes a new "command-line-interface" application.
 */

/**
 * TODO 🐷
 * - move to `@platform/cli` as [plugins] extension method on the `cli.IApp`.
 */

export function init() {
  const app = cli.create('cell');

  const plugins: t.ICmdPlugins = {
    commands: [],

    /**
     * Add a command to the application.
     */
    command(args: t.ICmdPluginCommandArgs) {
      const { name, description, alias, handler } = args;
      const id = [name, alias].filter(value => Boolean(value)) as string[];

      app.command(
        id,
        description,
        yargs => {
          cmd.options.forEach(args => {
            return yargs.option(args.name, {
              alias: args.alias,
              describe: args.description,
              type: args.type,
              default: args.default,
            });
          });
          return yargs;
        },
        async (argv: any) => {
          const args = cmd.options.reduce((acc, next) => {
            const { name, alias } = next;
            const value = argv[name] || argv[alias || ''];
            acc[name] = defaultValue(value, next.default);
            return acc;
          }, {});
          return cmd.handler(args);
        },
      );

      const cmd: t.ICmdPlugin = {
        name,
        description,
        alias,
        options: [],
        handler,
      };

      const res: t.ICmdPluginResponse = {
        ...cmd,
        option<T extends keyof t.ICmdPluginType>(args: t.ICmdPluginOption<T>) {
          cmd.options = [...cmd.options, args];
          return res;
        },
      };

      // Finish up.
      plugins.commands = [...plugins.commands, cmd];
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
  const { events$ } = app;
  return { events$, plugins };
}
