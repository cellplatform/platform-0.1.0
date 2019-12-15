import { R, t, value } from '../common';
import { Uri } from '../uri';
import { Url } from './Url';
import * as util from './util';
import { ROUTES } from './ROUTES';

/**
 * Standardised construction of URLs for the HTTP service.
 */
export class Urls {
  public static readonly uri = Uri;
  public static readonly routes = ROUTES;

  public static parse(input?: string) {
    input = (input || '').trim() || 'localhost';
    const host = R.pipe(util.stripHttp, util.stripSlash, util.stripPort)(input);
    const protocol = util.toProtocol(host);
    const port = util.toPort(input) || 80;
    const origin = port === 80 ? `${protocol}://${host}` : `${protocol}://${host}:${port}`;
    return { protocol, host, port, origin };
  }

  /**
   * [Lifecycle]
   */
  constructor(input?: string) {
    const { protocol, host, port, origin } = Urls.parse(input);
    this.host = host;
    this.protocol = protocol;
    this.port = port;
    this.origin = origin;
  }

  /**
   * [Fields]
   */

  public readonly protocol: t.HttpProtocol;
  public readonly host: string;
  public readonly port: number;
  public readonly origin: string;

  /**
   * [Properties]
   */

  public get sys() {
    const toPath = this.toUrl;
    return {
      get info() {
        return toPath('.sys');
      },
      get uid() {
        return toPath('.uid');
      },
    };
  }

  /**
   * [Methods]
   */

  /**
   * Builders for NAMESPACE urls.
   */
  public ns(input: string | t.IUrlParamsNs) {
    const toPath = this.toUrl;
    let id = typeof input === 'string' ? input : input.ns;

    if (id.includes(':')) {
      const uri = Uri.parse(id);
      const type = uri.parts.type;

      if (uri.error) {
        throw new Error(uri.error.message);
      }

      if (type === 'NS') {
        id = (uri.parts as t.INsUri).id;
      } else if (type === 'CELL') {
        id = (uri.parts as t.ICellUri).ns;
      } else {
        const err = `The id for the namespace is a URI, but not of type "ns:" or "cell:" ("${id}")`;
        throw new Error(err);
      }
    }

    return {
      /**
       * Example: /ns:foo
       */
      get info() {
        return toPath<t.IUrlQueryGetNs>(`/ns:${id}`);
      },
    };
  }

  /**
   * Builders for CELL urls.
   */
  public cell(input: string | t.IUrlParamsCell) {
    const toPath = this.toUrl;
    const uri = typeof input === 'string' ? input : Uri.create.cell(input.ns, input.key);
    const cell = Uri.parse<t.ICellUri>(uri);
    if (cell.error) {
      throw new Error(cell.error.message);
    }
    const { ns, key, type } = cell.parts;
    if (type !== 'CELL') {
      const err = `The given URI is a ${type} not a CELL ("${uri}")`;
      throw new Error(err);
    }

    return {
      /**
       * Example: /cell:foo!A1
       */
      get info() {
        type Q = t.IUrlQueryGetCell;
        return toPath<Q>(`/cell:${ns}!${key}`);
      },

      /**
       * Example: /cell:foo!A1/files
       */
      get files() {
        type Q = t.IUrlQueryGetCellFiles;
        return toPath<Q>(`/cell:${ns}!${key}/files`);
      },

      /**
       * Individual file.
       */
      file: {
        /**
         * Example: /cell:foo!A1/file/kitten.png
         */
        byName(name: string) {
          type Q = t.IUrlQueryGetCellFileByName;
          name = (name || '').trim();
          if (!name) {
            throw new Error(`Filename not provided.`);
          }
          return toPath<Q>(`/cell:${ns}!${key}/file/${name}`);
        },

        /**
         * Example: /cell:foo!A1/files/0
         */
        byIndex(input: number | string) {
          type Q = t.IUrlQueryGetCellFileByIndex;
          const index = value.toNumber(input);
          if (typeof index !== 'number') {
            throw new Error(`File index not provided.`);
          }
          return toPath<Q>(`/cell:${ns}!${key}/files/${index}`);
        },
      },
    };
  }

  /**
   * Builders for ROW urls.
   */
  public row(input: string | t.IUrlParamsRow) {
    const toPath = this.toUrl;
    const uri = typeof input === 'string' ? input : Uri.create.row(input.ns, input.key);
    const row = Uri.parse<t.IRowUri>(uri);
    if (row.error) {
      throw new Error(row.error.message);
    }
    const { ns, key, type } = row.parts;
    if (type !== 'ROW') {
      const err = `The given URI is a ${type} not a ROW ("${uri}")`;
      throw new Error(err);
    }

    return {
      /**
       * Example: /cell:foo!1
       */
      get info() {
        type Q = t.IUrlQueryGetRow;
        return toPath<Q>(`/cell:${ns}!${key}`);
      },
    };
  }

  /**
   * Builders for COLUMN urls.
   */
  public column(input: string | t.IUrlParamsColumn) {
    const toPath = this.toUrl;
    const uri = typeof input === 'string' ? input : Uri.create.column(input.ns, input.key);
    const column = Uri.parse<t.IColumnUri>(uri);
    if (column.error) {
      throw new Error(column.error.message);
    }
    const { ns, key, type } = column.parts;
    if (type !== 'COLUMN') {
      const err = `The given URI is a ${type} not a COLUMN ("${uri}")`;
      throw new Error(err);
    }

    return {
      /**
       * Example: /cell:foo!A
       */
      get info() {
        type Q = t.IUrlQueryGetColumn;
        return toPath<Q>(`/cell:${ns}!${key}`);
      },
    };
  }

  public file(input: string | t.IUrlParamsFile) {
    const toPath = this.toUrl;
    const uri = typeof input === 'string' ? input : Uri.create.file(input.ns, input.file);
    const file = Uri.parse<t.IFileUri>(uri);
    if (file.error) {
      throw new Error(file.error.message);
    }
    if (file.parts.type !== 'FILE') {
      const err = `The given URI is not of type "file:" ("${uri}")`;
      throw new Error(err);
    }

    const { id } = file.parts;
    return {
      get download() {
        type Q = t.IUrlQueryGetFile;
        return toPath<Q>(`/file:${id}`);
      },

      get info() {
        type Q = t.IUrlQueryGetFileInfo;
        return toPath<Q>(`/file:${id}/info`);
      },
    };
  }

  /**
   * [Internal]
   */
  private toUrl = <Q extends object>(path: string, options: { query?: Q } = {}): t.IUrl<Q> => {
    const { query } = options;
    return new Url<Q>({ origin: this.origin, path, query });
  };
}
