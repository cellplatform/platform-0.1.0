import { Schema, t, Uri } from '../common';
import { squash } from './value.squash';

const { sha256 } = Schema.hash;

/**
 * Hashing algorithms for CellOS data objects.
 */
export const hash = {
  sha256,

  /**
   * Generate a uniform hash (SHA-256) of the given NS data.
   * NOTE:
   *    The hash of the namespace is the "ns" object only.
   *
   *    It does not include the combined hashes of child data within the namespace.
   *    This is for performance reasons.
   *
   *    To work with hashes of the entire set of the namespace calculate
   *    these on a case-by-case bases as needed accounting for the cost
   *    of hashing potentially large datasets relative to the needs of
   *    the use-case.
   */
  ns(args: { uri: string; ns: t.INs }): string {
    const uri = (args.uri || '').trim();
    if (!Uri.is.ns(uri)) {
      throw new Error(`Hashing a NAMESPACE (NS) requires a valid URI. Given [${uri}]`);
    }

    // Format NS object.
    const ns = { ...args.ns };
    delete ns.hash; // NB: Any existing hash is excluded (this is a calculation of current value only).

    const obj = { uri, ns };
    return sha256(obj);
  },

  /**
   * Generate a uniform hash (SHA-256) of the given file.
   */
  file(args: { uri: string; data?: t.IFileData }): string {
    const uri = (args.uri || '').trim();
    if (!Uri.is.file(uri)) {
      throw new Error(`Hashing a FILE requires a valid URI. Given [${uri}]`);
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
      throw new Error(`Hashing a CELL requires a valid URI. Given [${uri}]`);
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
      throw new Error(`Hashing a ROW requires a valid URI. Given [${uri}]`);
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
      throw new Error(`Hashing a COLUMN requires a valid URI. Given [${uri}]`);
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
