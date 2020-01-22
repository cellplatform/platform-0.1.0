import { t } from '../common';
import { dirSync } from './dirSync';

export { getPayload } from './dirSync.payload';
export { dirSync as syncDir };

export type ISyncDirArgs = {
  force: boolean;
  silent: boolean;
  delete: boolean;
  watch: boolean;
};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<ISyncDirArgs> = async e => {
    const { argv } = e;

    // NB:  Keyboard is only activated if needed to avoid an event-loop preventing
    //      the CLI from stopping after completing its operation.
    const watch = argv.watch;
    const keyboard = watch ? e.keyboard : undefined;
    await dirSync({
      dir: process.cwd(),
      silent: argv.silent,
      force: argv.force,
      delete: argv.delete,
      watch,
      keyboard,
    });
  };

  cli
    .command<ISyncDirArgs>({
      name: 'dirsync',
      alias: 's',
      description: 'Synchronise local folder with remote',
      handler,
    })
    .option<'boolean'>({
      name: 'delete',
      alias: 'd',
      description: 'Delete remote files that are removed locally',
      type: 'boolean',
      default: true,
    })
    .option<'boolean'>({
      name: 'force',
      alias: 'f',
      description: 'Force push everything (including unchanged files)',
      type: 'boolean',
      default: false,
    })
    .option<'boolean'>({
      name: 'silent',
      alias: 's',
      description: 'Suppress log output',
      type: 'boolean',
      default: false,
    })
    .option<'boolean'>({
      name: 'watch',
      alias: 'w',
      description: 'Watch folder and sync on change',
      type: 'boolean',
      default: false,
    });

  return cli;
};
