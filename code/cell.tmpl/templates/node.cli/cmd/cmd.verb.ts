import { t, log } from '../common';
import * as util from '../util';

const logger = util.Logger;

/**
 * Command.
 */
export async function verb(argv: t.Argv) {
  logger.clear();
  log.info('🐷 run verb', argv);
}
