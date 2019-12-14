import { sha256, t, Uri } from '../common';
import { squash } from './value.cell';

/**
 * Hashing algorithms for CellOS data objects.
 */
export const hash = {
  sha256,

  /**
   * Generate a uniform hash (SHA-256) of the given NS data.
   * NOTE:
   *    Ensure [cell/row/column] data already has hashes calculated.
   */
  ns(args: { uri: string; ns: t.INs; data?: Partial<t.INsDataCoord> }): string {
    const uri = (args.uri || '').trim();
    if (!Uri.is.ns(uri)) {
      throw new Error(`Hashing a NAMESPACE (NS) requires a valid URI. Given "${uri}"`);
    }

    // Format NS object.
    const ns = { ...args.ns };
    delete ns.hash; // NB: Any existing hash is excluded (this is a calculation of current value only).

    // Build list of child hashes.
    let children: string[] = [];
    const { data = {} } = args;
    const { cells, rows, columns } = data;

    if (cells && !isEmptyObject(cells)) {
      children = [...children, ...getHashes(cells)];
    }
    if (rows && !isEmptyObject(rows)) {
      children = [...children, ...getHashes(rows)];
    }
    if (columns && !isEmptyObject(columns)) {
      children = [...children, ...getHashes(columns)];
    }

    const obj = { uri, ns, children };
    return sha256(obj);
  },

  /**
   * Generate a uniform hash (SHA-256) of the given file.
   */
  file(args: { uri: string; data?: t.IFileData }): string {
    const uri = (args.uri || '').trim();
    if (!Uri.is.file(uri)) {
      throw new Error(`Hashing a FILE requires a valid URI. Given "${uri}"`);
    }

    // Format data.
    const data = args.data as t.IFileData;
    const props = squash.object(data ? data.props : undefined);
    const error = data ? data.error : undefined;

    const obj: any = { uri };
    if (props) {
      obj.props = props;
    }
    if (error) {
      obj.error = error;
    }

    return sha256(obj);
  },

  /**
   * Generate a uniform hash (SHA-256) of the given cell.
   */
  cell(args: { uri: string; data?: t.ICellData }): string {
    const uri = (args.uri || '').trim();
    if (!Uri.is.cell(uri)) {
      throw new Error(`Hashing a CELL requires a valid URI. Given "${uri}"`);
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
   * Generate a uniform hash (SHA-256) of the given row.
   */
  row(args: { uri: string; data?: t.IRowData }): string {
    const { data } = args;
    const uri = (args.uri || '').trim();
    if (!Uri.is.row(uri)) {
      throw new Error(`Hashing a ROW requires a valid URI. Given "${uri}"`);
    }

    return hashAxis({ axis: 'row', uri, data });
  },

  /**
   * Generate a uniform hash (SHA-256) of the given column.
   */
  column(args: { uri: string; data?: t.IColumnData }): string {
    const { data } = args;
    const uri = (args.uri || '').trim();
    if (!Uri.is.column(uri)) {
      throw new Error(`Hashing a COLUMN requires a valid URI. Given "${uri}"`);
    }

    return hashAxis({ axis: 'column', uri, data });
  },
};

/**
 * [Helpers]
 */

function hashAxis(args: {
  axis: 'row' | 'column';
  uri: string;
  data?: t.IRowData | t.IColumnData;
}) {
  const uri = (args.uri || '').trim();

  const { data } = args;
  const props = squash.props(data ? data.props : undefined);
  const error = data ? data.error : undefined;

  const obj: any = { uri };
  if (props) {
    obj.props = props;
  }
  if (error) {
    obj.error = error;
  }

  return sha256(obj);
}

const getHashes = (map: t.IMap<{ hash?: string }>) => {
  return Object.keys(map).reduce((acc, key) => {
    const item = map[key];
    if (item && item.hash && item.hash !== '-') {
      acc.push(item.hash);
    }
    return acc;
  }, [] as string[]);
};

const isEmptyObject = (value?: any) => {
  return (typeof value === 'object' && Object.keys(value).length === 0) || false;
};
