import { util, log, promptConfig } from '../common';

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
  const parts = uri.parts;
  const host = util.url.stripHttp(config.data.host);
  const http = util.url.httpPrefix(config.data.host);
  const domain = log.gray(`${http}://${log.gray(host)}/`);
  const path = log.gray(`${log.cyan('cell')}:${log.magenta(parts.ns)}!${log.cyan(parts.key)}`);
  const url = log.white(`${domain}${path}`);

  log.info();
  log.info(`${url}`);
  log.info();
}
