import { Compiler } from '../../node/compiler';
import {
  constants,
  defaultValue,
  fs,
  HttpClient,
  log,
  Model,
  Package,
  PATH,
  Schema,
  t,
  Uri,
} from '../common';
import * as util from '../util';
import { runClean } from './cmd.clean';

const logger = util.logger;

type IFileStore = {
  [dir: string]: {
    [mode: string]: { uri: string };
  };
};

/**
 * Bundle and upload to a cell.
 */
export async function upload(argv: t.Argv) {
  const bump = util.bumpArg(argv);
  if (bump) await Package.bump(constants.PKG.PATH, bump);

  const bundle = argv.bundle; // NB: undefined by default (false if --no-bundle)
  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'production');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  const model = Model(config);
  const target = model.target();

  let uri: string | undefined = argv.uri;
  let targetDir: string = typeof argv.dir === 'string' ? argv.dir || '' : '';
  let host = typeof argv.host === 'number' ? `localhost:${argv.host}` : (argv.host as string) || '';
  host = host.trim();
  targetDir = targetDir.trim();

  if (!targetDir) {
    return logger.errorAndExit(1, `A ${log.white('--dir')} argument was not provided.`);
  }

  const args = await formatAndSaveArgs({ target, host, uri, targetDir });
  if (args) {
    host = args.host;
    uri = args.uri;
    targetDir = args.targetDir;
  }

  if (!host) {
    return logger.errorAndExit(1, `A ${log.white('--host')} argument was not provided.`);
  }

  // Ensure host is accessible.
  if (!(await HttpClient.isReachable(host))) {
    const err = `The target ${log.white(host)} is not reachable.`;
    return logger.errorAndExit(1, err);
  }

  // Wrangle the cell URI.
  const cell = uri && typeof uri === 'string' ? Uri.parse<t.ICellUri>(uri) : undefined;
  if (!cell) {
    const err = `A ${log.white('--uri')} argument was not provided.`;
    return logger.errorAndExit(1, err);
  }
  if (!cell.ok) {
    const err = `The given ${log.white('--uri')} value '${log.white(uri)}' contained errors`;
    return logger.errorAndExit(1, err, cell.error?.message);
  }
  if (cell.type !== 'CELL') {
    const err = `The given ${log.white('--uri')} value '${log.white(uri)}' is not a cell URI.`;
    return logger.errorAndExit(1, err);
  }

  if (defaultValue(argv.clean, true)) await runClean();
  const res = await Compiler.cell(host, cell.toString()).upload(config, { targetDir, bundle });

  const file = args.filepath.substring(fs.resolve('.').length + 1);
  log.info.gray(`Upload configuration stored in: ${file}`);
  return res;
}

/**
 * [Helpers]
 */

async function formatAndSaveArgs(args: {
  target: string;
  host?: string;
  uri?: string;
  targetDir?: string;
}) {
  const { target } = args;
  const host = args.host ? args.host : 'localhost:5000';
  const targetDir = args.targetDir ? args.targetDir : '';

  const logDir = PATH.LOGDIR;
  const filepath = fs.join(logDir, 'upload.json');
  await fs.ensureDir(logDir);

  const generateUri = () => Uri.create.cell(Uri.cuid(), 'A1');
  const write = (file: IFileStore) => fs.writeFile(filepath, JSON.stringify(file, null, '  '));

  if (!(await fs.pathExists(filepath))) {
    const file: IFileStore = {};
    await write(file);
  }

  const key = Schema.encoding.escapePath(`/${targetDir}` || '/');
  const file = (await fs.readJson(filepath)) as IFileStore;
  if (!file[key]) file[key] = {};
  if (!file[key][target]) {
    file[key][target] = { uri: generateUri() };
    await write(file);
  }

  const uri = file[key][target].uri;

  return {
    host,
    uri,
    filepath,
    targetDir,
  };
}
