import { cli, fs, log, util } from './common';

const TMPL = `
title:          # Title of this CellOS provider.

now:
  name:         # Deployment name.
  domain:       # Domain name (eg "domain.com").
  subdomain:    # (optional) sub-domain, ommit if root domain (aka "prod").
  mongo:        # Key to the [zeit/now] secret containing the mongo connection string.

`.substring(1);

/**
 * Initialize a new deployment.
 */
export async function run() {
  // Prepare the filename.
  const dir = await util.ensureConfigDir();
  let filename = await cli.prompt.text({ message: 'File name:', default: 'deploy.yml' });
  filename = filename.replace(/\.yml$/, '').replace(/\.yaml$/, '');
  filename = `${filename}.yml`;
  const file = fs.join(dir, filename);

  // Ensure the file does not already exist.
  if (await fs.pathExists(file)) {
    log.info();
    log.warn(`✋  A config file with that name already exists.`);
    log.info.gray(`   path: ${file}`);
    log.info();
    return;
  }

  // Create the file.
  await fs.writeFile(file, TMPL);
}
