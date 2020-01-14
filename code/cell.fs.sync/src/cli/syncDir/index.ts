import { t } from '../common';
import { syncDir } from './syncDir';

export type ISyncDirArgs = {
  force: boolean;
  silent: boolean;
  delete: boolean;
  watch: boolean;
};

export const init: t.CmdPluginsInit = cli => {
  const handler: t.CmdPluginHandler<ISyncDirArgs> = async e => {
    const { argv, keyboard } = e;
    await syncDir({
      dir: process.cwd(),
      silent: argv.silent,
      force: argv.force,
      delete: argv.delete,
      watch: argv.watch,
      keyboard,
    });
  };

  cli
    .command<ISyncDirArgs>({
      name: 'syncdir',
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
