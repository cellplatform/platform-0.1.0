import { util, open, log, promptConfig } from '../common';

const gray = log.info.gray;

/**
 * Inspect or configure a folder.
 */
export async function dir(args: {
  dir: string;
  configure: boolean;
  local: boolean;
  remote: boolean;
}) {
  // Retrieve (or build) configuration file for the directory.
  const config = await promptConfig({ dir: args.dir, force: args.configure });
  if (!config.isValid) {
    return;
  }

  // Print the target URL.
  const uri = config.target.uri;
  const key = uri.parts.key;
  const keyTitle = util.log.cellKeyBg(key);

  const f = util.log.cellUri(config.target.uri);

  log.info();
  log.info(keyTitle);
  log.info();

  gray(`host:     ${config.data.host.replace(/\/*$/, '')}`);
  gray(`target:   ${util.log.cellUri(uri, 'blue')}`);
  log.info();

  let printFinalBlankLine = false;

  // Open the local folder.
  if (args.local) {
    open(config.dir);
  } else {
    gray(`• Use ${log.cyan('--local (-l)')} to open folder locally`);
    printFinalBlankLine = true;
  }

  // Open the remote target cell (browser).
  if (args.remote) {
    open(config.target.url);
  } else {
    gray(`• Use ${log.cyan('--remote (-r)')} to open remote target in browser`);
    printFinalBlankLine = true;
  }

  if (printFinalBlankLine) {
    log.info();
  }
}
