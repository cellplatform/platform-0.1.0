import { sha256, t } from '../common';
import { squash } from './value.cell';

/**
 * Hashing algorithms for CellOS data objects.
 */
export const hash = {
  /**
   * Generate a uniform hash (SHA-256) of the given cell's value/props.
   */
  cell(args: { uri: string; data?: t.ICellData }): string {
    const uri = args.uri.trim();
    if (!uri.startsWith('cell:')) {
      throw new Error(`Hashing requires a valid cell URI. Given uri "${uri}".`);
    }

    const { data } = args;
    const value = data ? data.value : undefined;
    const props = squash.props(data ? data.props : undefined);
    const error = data ? data.error : undefined;
    const links = data ? data.links : undefined;

    const obj: any = { uri };
    if (value) {
      obj.value = value;
    }
    if (props) {
      obj.props = props;
    }
    if (error) {
      obj.error = error;
    }
    if (links) {
      obj.links = links;
    }

    return sha256(obj);
  },

  /**
   * Generate a uniform hash (SHA-256) of the given NS data.
   */
  ns(args: { uri: string; ns: t.INs; data?: Partial<t.INsCoordData> }): string {
    const uri = args.uri.trim();
    if (!uri.startsWith('ns:')) {
      throw new Error(`Hashing requires a valid ns URI. Given uri "${uri}".`);
    }

    // Format NS object.
    const ns = { ...args.ns };
    delete ns.hash;

    // Round up child hashes.
    const children: string[] = [];
    const { data = {} } = args;
    const { cells, rows, columns } = data;

    if (cells) {
      Object.keys(cells).forEach(key => {
        const cell = cells[key];
        if (cell) {
          const f = cell.hash;
        }
      });
    }

    const obj: any = { uri, ns, children };

    return sha256(obj);
  },
};
