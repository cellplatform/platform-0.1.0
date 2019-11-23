import * as t from './types';
import * as cell from './util.cell';

export { cell };
export { coord } from './libs';

export const cellData = cell.cellData;
export const value = cell.value;
export const hash = value.hash;

/**
 * Convert a model change list to [IDbModelChanges].
 */
export function toDbModelChanges(
  uri: string,
  changes: t.IModelChanges<any, any>,
): t.IDbModelChange[] {
  return changes.list.map(c => {
    const { field, value } = c;
    const { from, to } = value;
    return { uri, field, from, to };
  });
}
