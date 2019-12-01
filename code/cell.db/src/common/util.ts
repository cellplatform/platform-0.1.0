import { mime } from './libs';
import * as cell from './util.cell';

export { cell };
export { coord } from './libs';

export const cellData = cell.cellData;
export const value = cell.value;
export const hash = value.hash;
export const squash = value.squash;

/**
 * Get the mime-type for the given filename.
 * Derived from extension.
 */
export function toMimetype(filename: string = '') {
  const type = mime.lookup(filename);
  return typeof type === 'string' ? type : undefined;
}
