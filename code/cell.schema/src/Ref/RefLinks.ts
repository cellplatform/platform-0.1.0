import { t, queryString } from '../common';
import { Uri } from '../Uri';
import { Links } from '../Links';

const prefix = 'ref';
const ref = Links.create(prefix);

/**
 * Helpers for operating on [ref] links,
 * aka. links to other namespaces/sheets, cells, columns or rows.
 */
export class RefLinks {
  public static prefix = prefix;

  public static is = {
    refKey(input?: string) {
      return ref.isKey(input);
    },
    refValue(input?: string) {
      input = (input || '').toString().trim();
      const uri = Uri.parse(input);
      return ['NS', 'CELL', 'ROW', 'COLUMN'].includes(uri.type);
    },
  };
}
