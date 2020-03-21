import * as t from './types';
import { chalk, Schema } from './libs';
export { chalk };

export type Color = 'blue' | 'yellow' | 'gray';

export function cellKeyBg(key: string, color?: Color) {
  const fn = (color || 'blue') === 'blue' ? chalk.bgBlue.black : chalk.bgYellow.black;
  return fn(` ${key} `);
}

export function cellUri(input: string | t.IUriParts<t.ICellUri>, color?: Color) {
  const uri = typeof input === 'string' ? Schema.uri.parse<t.ICellUri>(input) : input;
  const { ns, key } = uri.parts;
  const cellKey = color === 'gray' ? chalk.gray(key) : toColor(color)(key);
  return `cell:${ns}:${cellKey}`;
}

/**
 * Helpers
 */
const toColor = (color?: Color) => chalk[color || 'gray'];
