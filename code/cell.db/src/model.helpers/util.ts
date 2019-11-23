import { t } from '../common';

/**
 * Convert a model change list to [IDbModelChanges].
 */
export function toChanges(uri: string, changes: t.IModelChanges<any, any>): t.IDbModelChange[] {
  return changes.list.map(change => {
    const { field, value } = change;
    const { from, to } = value;
    return { uri, field, from, to };
  });
}
