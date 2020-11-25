import { R, t, value, constants } from '../common';
import { Uri } from '../Uri';
import { Url } from './Url';
import * as util from './util';
import { ROUTES } from '../ROUTES';

type O = Record<string, unknown>;

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

    const hostname = R.pipe(util.stripHttp, util.stripSlash, util.stripPort)(text);
    const protocol = util.toProtocol(hostname);
    const port = util.toPort(text) || 80;
    const host = port === 80 ? hostname : `${hostname}:${port}`;
    const origin = `${protocol}://${host}`;
    return { protocol, hostname, host, port, origin };
  }

  /**
   * [Lifecycle]
   */
  private constructor(input?: string | number) {
    const { protocol, host, hostname, port, origin } = Urls.parse(input);
    this.hostname = hostname;
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
  public readonly hostname: string;
  public readonly port: number;
  public readonly origin: string;

  /**
   * [Properties]
   */

  public get sys() {
    const toUrl = this.toUrl;
    return {
      get info() {
        type Q = t.IReqQuerySysInfo;
        return toUrl<Q>('.sys');
      },
      get uid() {
        type Q = t.IReqQuerySysUid;
        return toUrl<Q>('.uid');
      },
    };
  }

  public get local() {
    const toUrl = this.toUrl;
    return {
      get fs() {
        type Q = t.IReqQueryLocalFs;
        return toUrl<Q>(`/local/fs`);
      },
    };
  }

  /**
   * Runtime (function execution).
   */
  public get runtime() {
    const self = this; // eslint-disable-line
    const toUrl = this.toUrl;

    const throwOnHostMistmatch = (bundle: t.RuntimeBundleOrigin) => {
      if (util.stripHttp(bundle.host) !== self.host) {
        throw new Error(`Host mismatch ('${bundle.host}' should be '${self.host}')`);
      }
    };

    const trimDir = (dir?: string) => (dir || '').trim().replace(/^\/*/, '').replace(/\/*$/, '');

    return {
      /**
       * Example: /func
       */
      get func() {
        type Q = t.IReqQueryFunc;
        return toUrl<Q>(`/run:func`);
      },

      /**
       * Example: <see file download URL>
       */
      manifest(bundle: t.RuntimeBundleOrigin) {
        throwOnHostMistmatch(bundle);
        const FILENAME = constants.BUNDLE.MANIFEST.FILENAME;
        const dir = trimDir(bundle.dir);
        const filename = dir ? `${dir}/${FILENAME}` : FILENAME;
        return self.cell(bundle.uri).file.byName(filename);
      },

      /**
       * Bundle files.
       * Example: <see files list>
       */
      files(bundle: t.RuntimeBundleOrigin) {
        throwOnHostMistmatch(bundle);
        const dir = trimDir(bundle.dir);
        let url = self.cell(bundle.uri).files.list;
        url = dir ? url.query({ filter: `${dir}/**` }) : url;
        return url;
      },
    };
  }

  /**
   * [Methods]
   */

  /**
   * Builders for NAMESPACE urls.
   */
  public ns(input: string | t.INsUri) {
    const toUrl = this.toUrl;
    let id = (typeof input === 'string' ? input : input.id) || '';

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
        return toUrl<t.IReqQueryNsInfo>(`/ns:${id}`);
      },
    };
  }

  /**
   * Builders for CELL urls.
   */
  public cell(input: string | t.ICellUri) {
    const toUrl = this.toUrl;
    const uri = Uri.cell(input);
    const { ns, key, type } = uri;
    if (type !== 'CELL') {
      const err = `The given URI is a ${type} not a CELL ("${input.toString()}")`;
      throw new Error(err);
    }

    const api = {
      uri: uri.toString(),

      /**
       * Example: /cell:foo:A1
       */
      get info() {
        type Q = t.IReqQueryCellInfo;
        return toUrl<Q>(`/cell:${ns}:${key}`);
      },

      /**
       * All files related to the cell.
       */
      files: {
        /**
         * Example: /cell:foo:A1/files
         */
        get list() {
          type Q = t.IReqQueryCellFilesList;
          return toUrl<Q>(`/cell:${ns}:${key}/files`);
        },

        /**
         * Example: /cell:foo:A1/files
         */
        get delete() {
          type Q = t.IReqQueryCellFilesDelete;
          return toUrl<Q>(`/cell:${ns}:${key}/files`);
        },

        /**
         * Example: /cell:foo:A1/files/copy
         */
        get copy() {
          type Q = t.IReqQueryCellFilesCopy;
          return toUrl<Q>(`/cell:${ns}:${key}/files/copy`);
        },

        /**
         * Example: /cell:foo:A1/files/upload
         */
        get upload() {
          type Q = t.IReqQueryCellFilesUpload;
          return toUrl<Q>(`/cell:${ns}:${key}/files/upload`);
        },

        /**
         * Example: /cell:foo:A1/files/uploaded
         */
        get uploaded() {
          type Q = t.IReqQueryCellFilesUploaded;
          return toUrl<Q>(`/cell:${ns}:${key}/files/uploaded`);
        },
      },

      /**
       * Individual file.
       */
      file: {
        toString() {
          return `/cell:${ns}:${key}/file/`;
        },

        /**
         * Example: /cell:foo:A1/file/kitten.png
         */
        byName(filename: string) {
          type Q = t.IReqQueryCellFileDownloadByName;
          filename = (filename || '').trim();
          if (!filename) {
            throw new Error(`Filename not provided.`);
          }
          return toUrl<Q>(`/cell:${ns}:${key}/file/${filename}`);
        },

        /**
         * Example: /cell:foo:A1/file:abc123.png
         */
        byFileUri(fileUri: string, fileExtension?: string) {
          type Q = t.IReqQueryCellFileDownloadByFileUri;
          fileExtension = (fileExtension || '').trim();
          const uri = Uri.file(fileUri);
          if (uri.type !== 'FILE') {
            throw new Error(`The given URI [${fileUri}] is not of type [file:]`);
          }
          const ext = (fileExtension || '').trim().replace(/^\.*/, '');
          const filename = `${uri.file}${ext ? `.${ext}` : ''}`.trim();
          if (!filename) {
            throw new Error(`File uri/name could not be derived..`);
          }
          const file = `file:${filename}`;
          return toUrl<Q>(`/cell:${ns}:${key}/${file}`);
        },
      },
    };

    return api;
  }

  /**
   * Builders for ROW urls.
   */
  public row(input: string | t.IRowUri) {
    const toUrl = this.toUrl;
    const uri = Uri.row(input);
    const { ns, key, type } = uri;
    if (type !== 'ROW') {
      const err = `The given URI is a ${type} not a ROW ("${input.toString()}")`;
      throw new Error(err);
    }

    return {
      uri: uri.toString(),

      /**
       * Example: /cell:foo:1
       */
      get info() {
        type Q = t.IReqQueryRowInfo;
        return toUrl<Q>(`/cell:${ns}:${key}`);
      },
    };
  }

  /**
   * Builders for COLUMN urls.
   */
  public column(input: string | t.IColumnUri) {
    const toUrl = this.toUrl;
    const uri = Uri.column(input);

    const { ns, key, type } = uri;
    if (type !== 'COLUMN') {
      const err = `The given URI is a ${type} not a COLUMN ("${input.toString()}")`;
      throw new Error(err);
    }

    return {
      uri: uri.toString(),

      /**
       * Example: /cell:foo:A
       */
      get info() {
        type Q = t.IReqQueryColumnInfo;
        return toUrl<Q>(`/cell:${ns}:${key}`);
      },
    };
  }

  public file(input: string | t.IFileUri) {
    const toUrl = this.toUrl;
    const uri = Uri.file(input);

    if (uri.type !== 'FILE') {
      const err = `The given URI is not of type "file:" ("${input.toString()}")`;
      throw new Error(err);
    }

    const { id } = uri;
    return {
      uri: uri.toString(),

      get info() {
        type Q = t.IReqQueryFileInfo;
        return toUrl<Q>(`/file:${id}/info`);
      },

      get download() {
        type Q = t.IReqQueryFileDownload;
        return toUrl<Q>(`/file:${id}`);
      },

      get delete() {
        type Q = t.IReqQueryFileDelete;
        return toUrl<Q>(`/file:${id}`);
      },

      get uploaded() {
        type Q = t.IReqQueryFileUploadComplete;
        return toUrl<Q>(`/file:${id}/uploaded`);
      },
    };
  }

  /**
   * [INTERNAL]
   */

  private toUrl = <Q extends O>(path: string, options: { query?: Q } = {}): t.IUrl<Q> => {
    const { query } = options;
    const origin = this.origin;
    return new Url<Q>({ origin, path, query });
  };
}
