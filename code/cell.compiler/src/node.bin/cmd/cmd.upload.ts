import { Compiler } from '../../node/Compiler';
import { log, t, Uri } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Bundle and upload to a cell.
 */
export async function upload(argv: t.Argv) {
  const name = util.nameArg(argv);
  const config = await util.loadConfig(argv.config, { name });
  const host = (((argv.host || argv.h) as string) || '').trim();

  if (!host) {
    return logger.errorAndExit(1, `A ${log.cyan('--host')} argument was not provided.`);
  }

  // Wrangle the cell URI.
  const uri: string | undefined = argv.uri;
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

  const targetDir: string | undefined = argv.dir;
  return Compiler.cell(host, cell.toString()).upload(config, { targetDir });
}
