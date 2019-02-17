import * as Listr from 'listr';
export { Listr };

/**
 * HACK: Typing issues with the chalk library.
 *       version `chalk@2.4.2`.
 */
import * as ChalkTypes from 'chalk';
export const chalk = require('chalk') as ChalkTypes.Chalk;
