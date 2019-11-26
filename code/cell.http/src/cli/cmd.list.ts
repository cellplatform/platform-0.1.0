import { log, util, fs } from './common';

/**
 * List available deployment configurations.
 */
export async function run() {
  // Read in the config files.
  const dir = await util.ensureConfigDir();
  const filenames = (await fs.readdir(dir)).filter(name =>
    ['.yml', '.yaml'].some(ext => name.endsWith(ext)),
  );

  // Check for no filenames.
  if (filenames.length === 0) {
    log.info();
    log.warn(`✋  The "config" folder does not contain any deployment YAML files.`);
    log.info.gray(`   dir: ${dir}`);
    log.info();
    log.info(`   Run ${log.cyan(`cell init`)} to configure a new deployment.`);
    log.info();
    return;
  }

  // List files.
  log.info();
  log.info.gray(`${dir}/`);
  filenames.forEach(file => {
    const name = file.replace(/\.yml$/, '');
    log.info.gray(`- ${log.cyan(name)}${fs.extname(file)}`);
  });
  log.info();
}
