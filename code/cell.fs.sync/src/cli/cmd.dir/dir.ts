import { log, promptConfig, util, fs, open } from '../common';

const gray = log.info.gray;

// import { open as openTarget } from './libs';

/**
 * Inspect or configure a folder.
 */
export async function dir(args: {
  dir: string;
  configure: boolean;
  local: boolean;
  remote: boolean;
}) {
  // Open configuation in code-editor if re-edit is required
  // and the folder has already been configured.
  if (args.configure) {
    return util.openConfig();
  }

  // Retrieve (or build) configuration file for the directory.
  const config = await promptConfig({ dir: args.dir, force: args.configure });
  if (!config.isValid) {
    return;
  }

  // Print host and target systems.
  const uri = config.target.uri;
  const key = uri.parts.key;
  const keyTitle = util.log.cellKeyBg(key);

  const hostParts = config.data.host.replace(/\/*$/, '').split('.');
  const host = hostParts
    .map((part, i) => ({ part, isLast: i === hostParts.length - 1 }))
    .map(({ part, isLast }) => (isLast ? part : log.blue(part)))
    .join('.');

  log.info(`${keyTitle}`);
  log.info();

  gray(`host:     ${host}`);
  gray(`target:   ${util.log.cellUri(uri, 'blue')}`);
  log.info();

  let count = 0;

  const cmd = (name: string, alias: string) => {
    return `${log.cyan(name)} (${log.cyan(alias)})`;
  };

  // Open the local folder.
  if (args.local) {
    util.open(config).local();
  } else {
    gray(`• Use ${cmd('--local', '-l')} to open folder locally`);
    count++;
  }

  // Open the remote target cell (browser).
  if (args.remote) {
    util.open(config).remote();
  } else {
    gray(`• Use ${cmd('--remote', '-r')} to open remote target in browser`);
    count++;
  }

  gray(`• Use ${cmd('--configure', '-c')} to reconfigure the folder`);
  count++;

  // Watch command.
  if (count > 0) {
    gray(`• or watch and sync with ${log.cyan('cell w')}`);
  } else {
    gray(`• to watch and sync run ${log.cyan('cell w')}`);
  }

  // Finish up.
  log.info();
}
