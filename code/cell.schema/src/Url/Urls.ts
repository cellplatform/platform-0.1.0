import { R, t, value } from '../common';
import { Uri } from '../Uri';
import { Url } from './Url';
import * as util from './util';
import { ROUTES } from './ROUTES';

/**
 * Standardised construction of URLs for the HTTP service.
 */
export class Urls implements t.IUrls {
  public static readonly uri = Uri;
  public static readonly routes = ROUTES;

  public static create(input?: string | number): t.IUrls {
    return new Urls(input);
  }

  public static parse(input?: string | number) {
    input = value.isNumeric(input) ? `localhost:${input}` : input?.toString();
    let text = (input || '').trim();
    text = text || 'localhost';

    const host = R.pipe(util.stripHttp, util.stripSlash, util.stripPort)(text);
    const protocol = util.toProtocol(host);
    const port = util.toPort(text) || 80;
    const origin = port === 80 ? `${protocol}://${host}` : `${protocol}://${host}:${port}`;
    return { protocol, host, port, origin };
  }

  /**
   * [Lifecycle]
   */
  private constructor(input?: string | number) {
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

  public get local() {
    const toPath = this.toUrl;
    return {
      get fs() {
        type Q = t.IUrlQueryLocalFs;
        return toPath<Q>(`/local/fs`);
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

    if (!id.includes(':')) {
      id = `ns:${id}`; // NB: Only the ID (cuid) was passed. Prepend with namespace token.
    }

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

    return {
      uri: uri.toString(),

      /**
       * Example: /ns:foo
       */
      get info() {
        return toPath<t.IUrlQueryNsInfo>(`/ns:${id}`);
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

    const api = {
      uri,

      /**
       * Example: /cell:foo:A1
       */
      get info() {
        type Q = t.IUrlQueryCellInfo;
        return toPath<Q>(`/cell:${ns}:${key}`);
      },

      /**
       * All files related to the cell.
       */
      files: {
        /**
         * Example: /cell:foo:A1/files
         */
        get list() {
          type Q = t.IUrlQueryCellFilesList;
          return toPath<Q>(`/cell:${ns}:${key}/files`);
        },

        /**
         * Example: /cell:foo:A1/files
         */
        get delete() {
          type Q = t.IUrlQueryCellFilesDelete;
          return toPath<Q>(`/cell:${ns}:${key}/files`);
        },

        /**
         * Example: /cell:foo:A1/files/upload
         */
        get upload() {
          type Q = t.IUrlQueryCellFilesUpload;
          return toPath<Q>(`/cell:${ns}:${key}/files/upload`);
        },

        /**
         * Example: /cell:foo:A1/files/uploaded
         */
        get uploaded() {
          type Q = t.IUrlQueryCellFilesUploaded;
          return toPath<Q>(`/cell:${ns}:${key}/files/uploaded`);
        },
      },

      /**
       * Individual file.
       */
      file: {
        /**
         * Example: /cell:foo:A1/file/kitten.png
         */
        byName(filename: string) {
          type Q = t.IUrlQueryCellFileDownloadByName;
          filename = (filename || '').trim();
          if (!filename) {
            throw new Error(`Filename not provided.`);
          }
          return toPath<Q>(`/cell:${ns}:${key}/file/${filename}`);
        },

        /**
         * Example: /cell:foo:A1/file:abc123.png
         */
        byFileUri(fileUri: string, fileExtension?: string) {
          type Q = t.IUrlQueryCellFileDownloadByFileUri;
          fileExtension = (fileExtension || '').trim();
          const uri = Uri.parse<t.IFileUri>(fileUri).parts;
          if (uri.type !== 'FILE') {
            throw new Error(`The given URI [${fileUri}] is not of type [file:]`);
          }
          const ext = (fileExtension || '').trim().replace(/^\.*/, '');
          const filename = `${uri.file}${ext ? `.${ext}` : ''}`.trim();
          if (!filename) {
            throw new Error(`File uri/name could not be derived..`);
          }
          const file = `file:${filename}`;
          return toPath<Q>(`/cell:${ns}:${key}/${file}`);
        },
      },
    };

    return api;
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
      uri,

      /**
       * Example: /cell:foo:1
       */
      get info() {
        type Q = t.IUrlQueryRowInfo;
        return toPath<Q>(`/cell:${ns}:${key}`);
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
      uri,

      /**
       * Example: /cell:foo:A
       */
      get info() {
        type Q = t.IUrlQueryColumnInfo;
        return toPath<Q>(`/cell:${ns}:${key}`);
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
      uri,

      get info() {
        type Q = t.IUrlQueryFileInfo;
        return toPath<Q>(`/file:${id}/info`);
      },

      get download() {
        type Q = t.IUrlQueryFileDownload;
        return toPath<Q>(`/file:${id}`);
      },

      get delete() {
        type Q = t.IUrlQueryFileDelete;
        return toPath<Q>(`/file:${id}`);
      },

      get uploaded() {
        type Q = t.IUrlQueryFileUploadComplete;
        return toPath<Q>(`/file:${id}/uploaded`);
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
