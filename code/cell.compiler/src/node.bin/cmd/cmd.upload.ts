import { Compiler } from '../../node/Compiler';
import { log, t, Uri, HttpClient, fs, PATH } from '../common';
import * as util from '../util';

const logger = util.logger;

type ISampleFile = { uri: string };

/**
 * Bundle and upload to a cell.
 */
export async function upload(argv: t.Argv) {
  const name = util.nameArg(argv) || 'prod';
  const config = await util.loadConfig(argv.config, { name });
  let host = ((argv.host as string) || '').trim();
  let uri: string | undefined = argv.uri;
  let targetDir: string | undefined = argv.dir;
  const bundle = argv.bundle;

  // If a "sample upload" was request, wrangle arguments.
  const sample = Boolean(argv.sample) ? await toSampleArgs({ host, uri, targetDir }) : undefined;
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

  const res = await Compiler.cell(host, cell.toString()).upload(config, { targetDir, bundle });

  if (sample) {
    const file = sample.configfile.substring(fs.resolve('.').length + 1);
    log.info.gray(`NB: Sample upload configuration used (${log.white('--sample')})`);
    log.info.gray(`    ${file}`);
  }

  return res;
}

/**
 * [Helpers]
 */

async function toSampleArgs(args: { host?: string; uri?: string; targetDir?: string }) {
  const host = args.host ? args.host : 'localhost:5000';
  const targetDir = args.targetDir ? args.targetDir : 'sample';
  const cachedir = fs.join(PATH.cachedir, 'sample');
  const configfile = fs.join(cachedir, 'upload.json');

  await fs.ensureDir(cachedir);

  if (!(await fs.pathExists(configfile))) {
    const uri = Uri.create.cell(Uri.cuid(), 'A1');
    const file: ISampleFile = { uri };
    await fs.writeJson(configfile, file);
  }

  const file = (await fs.readJson(configfile)) as ISampleFile;
  const uri = file.uri;

  return { host, uri, configfile, targetDir };
}
