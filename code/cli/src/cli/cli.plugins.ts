import { Observable } from 'rxjs';
import { defaultValue, t } from '../common';

/**
 * Initializes the plugin-manager for the given app.
 */
export function init(args: {
  cli: t.ICmdApp;
  events$: Observable<t.CmdAppEvent>;
  exit: t.CmdAppExit;
}) {
  const { cli, events$, exit } = args;

  const plugins: t.ICmdPlugins = {
    events$,
    exit,
    commands: [],

    /**
     * Add a command to the application.
     */
    command(args: t.ICmdPluginArgs) {
      const { name, description, alias, handler } = args;
      const id = [name, alias].filter(value => Boolean(value)) as string[];

      cli.command(
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
          argv = cmd.options.reduce((acc, next) => {
            const { name, alias } = next;
            const value = argv[name] || argv[alias || ''];
            acc[name] = defaultValue(value, next.default);
            return acc;
          }, {});
          const args: t.ICmdPluginHandlerArgs = {
            events$,
            exit,
            argv,
            get keyboard() {
              return cli.keyboard;
            },
          };
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
  };

  // Finish up.
  return plugins;
}
