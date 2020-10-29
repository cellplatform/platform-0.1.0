import { Compiler } from '../../node/Compiler';
import { log, t, Uri, HttpClient, fs, PATH, Model, defaultValue } from '../common';
import * as util from '../util';

const logger = util.logger;

type ISampleFile = { [mode: string]: { uri: string } };

/**
 * Bundle and upload to a cell.
 */
export async function upload(argv: t.Argv) {
  const name = util.nameArg(argv) || 'prod';
  const config = await util.loadConfig(argv.config, { name });
  const model = Model(config);
  const target = model.target();

  let host = ((argv.host as string) || '').trim();
  let uri: string | undefined = argv.uri;
  let targetDir: string | undefined = argv.dir;

  // If a "sample upload" was request, wrangle arguments.
  const sample = Boolean(argv.sample)
    ? await toSampleArgs({ target, host, uri, targetDir })
    : undefined;
  if (sample) {
    host = sample.host;
    uri = sample.uri;
    targetDir = sample.targetDir;
  }

  if (!host) {
    return logger.errorAndExit(1, `A ${log.cyan('--host')} argument was not provided.`);
  }

  // Ensure host is accessible.
  if (!(await HttpClient.isReachable(host))) {
    const err = `The host ${log.white(host)} is not reachable.`;
    return logger.errorAndExit(1, err);
  }

  // Wrangle the cell URI.
  const cell = uri && typeof uri === 'string' ? Uri.parse<t.ICellUri>(uri) : undefined;
  if (!cell) {
    const err = `A ${log.cyan('--uri')} argument was not provided.`;
    return logger.errorAndExit(1, err);
  }
  if (!cell.ok) {
    const err = `The given ${log.cyan('--uri')} value '${log.white(uri)}' contained errors`;
    return logger.errorAndExit(1, err, cell.error?.message);
  }
  if (cell.type !== 'CELL') {
    const err = `The given ${log.cyan('--uri')} value '${log.white(uri)}' is not a cell URI.`;
    return logger.errorAndExit(1, err);
  }

  const res = await Compiler.cell(host, cell.toString()).upload(config, { targetDir });

  if (sample) {
    const file = sample.filepath.substring(fs.resolve('.').length + 1);
    log.info.gray(`NB: Sample upload configuration used (${log.white('--sample')})`);
    log.info.gray(`    ${file}`);
  }

  return res;
}

/**
 * [Helpers]
 */

async function toSampleArgs(args: {
  target: string;
  host?: string;
  uri?: string;
  targetDir?: string;
}) {
  const { target } = args;
  const host = args.host ? args.host : 'localhost:5000';
  const targetDir = args.targetDir ? args.targetDir : 'sample';
  const tmp = fs.join(PATH.tmp, 'sample');
  const filepath = fs.join(tmp, 'upload.json');

  await fs.ensureDir(tmp);
  const exists = await fs.pathExists(filepath);
  const generateUri = () => Uri.create.cell(Uri.cuid(), 'A1');
  const write = (file: ISampleFile) => fs.writeFile(filepath, JSON.stringify(file, null, '  '));

  if (!exists) {
    const file: ISampleFile = {};
    await write(file);
  }

  const file = (await fs.readJson(filepath)) as ISampleFile;
  if (!file[target]) {
    file[target] = { uri: generateUri() };
    await write(file);
  }

  const uri = file[target].uri;

  return {
    host,
    uri,
    filepath,
    targetDir,
  };
}
