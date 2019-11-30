import { log, util, fs, cli } from './common';

/**
 * List available deployment configurations.
 */
export async function run() {
  // Read in the config files.
  const files = await getConfigFiles();
  const dir = files.dir;

  // Ensure there is at least one configuration file.
  if (files.isEmpty) {
    return logNoConfigFiles({ dir });
  }

  // List files.
  log.info();
  files.names.forEach(file => {
    const name = trimYaml(file);
    const ext = fs.extname(file);
    log.info.gray(`${dir}/${log.cyan(name)}${ext}`);
  });
  log.info();
}

/**
 * Retrieve the list of configuration files.
 */
export async function getConfigFiles(args: { dir?: string } = {}) {
  const dir = await util.ensureConfigDir({ dir: args.dir });
  const names = (await fs.readdir(dir)).filter(name => isYaml(name));
  const paths = names.map(name => fs.join(dir, name));
  const length = paths.length;
  const isEmpty = length === 0;

  type P = { message?: string; pageSize?: number };
  const prompt = async <T>(args: P & { type: 'list' | 'checkbox' }) => {
    const { message = 'deploy:', pageSize = 10, type } = args;
    const items = paths.map(value => {
      const name = ` ${trimYaml(fs.basename(value))}`;
      return { name, value };
    });
    return cli.prompt.list<T>({ message, items, pageSize, type });
  };

  return {
    isEmpty,
    length,
    dir,
    names,
    paths,
    async promptOne(args: P = {}) {
      return prompt<string>({ ...args, type: 'list' });
    },
    async promptMany(args: P = ({} = {})) {
      return prompt<string[]>({ ...args, type: 'checkbox' });
    },
  };
}

/**
 * Log a warning that there are no configuration files in the folder.
 */
export function logNoConfigFiles(args: { dir: string }) {
  log.info();
  log.warn(`✋  The "config" folder does not contain any deployment YAML files.`);
  log.info.gray(`   dir: ${args.dir}`);
  log.info();
  log.info(`   Run ${log.cyan(`cell init`)} to configure a new deployment.`);
  log.info();
}

/**
 * [Helpers]
 */
const isYaml = (name: string) => ['.yml', '.yaml'].some(ext => name.endsWith(ext));
const trimYaml = (input: string) => input.replace(/\.yml$/, '').replace(/\.yaml$/, '');
