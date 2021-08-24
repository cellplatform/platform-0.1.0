import { asArray, CellAddress, Path, PathUri, R, t } from './common';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusControllerCell(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<t.SysFsEvent>;
  index: t.FsIndexer;
  events: t.SysFsEvents;
  httpFactory: (host: string | number) => t.IHttpClient;
}) {
  const { id, index, fs, bus, events } = args;
  const trimRootDir = (path: string) =>
    path.startsWith(fs.dir) ? path.substring(fs.dir.length) : path;

  /**
   * Push
   */
  events.remote.push.req$.subscribe(async (e) => {
    const { tx } = e;

    const fail = (...errors: t.SysFsError[]) => done({ errors });
    const done = (args: { errors?: t.SysFsError[]; files?: t.SysFsPushedFile[] }) => {
      const { files = [] } = args;
      const errors = (args.errors ?? []).filter(Boolean) as t.SysFsError[];
      const ok = errors.length === 0;
      bus.fire({
        type: 'sys.fs/cell/push:res',
        payload: { ok, tx, id, files, errors },
      });
    };

    type U = {
      path: string;
      hash: string;
      bytes: number;
      payload?: t.IHttpClientCellFileUpload;
      error?: t.SysFsError;
    };

    const prepareUpload = async (path: string): Promise<U> => {
      path = trimRootDir(path);
      const res: U = { path, hash: '', bytes: -1 };
      const read = await fs.read(PathUri.ensurePrefix(path));

      if (read.error) {
        const error: t.SysFsError = { code: 'cell/push', message: read.error.message };
        return { ...res, error };
      }

      if (!read.file) {
        const error: t.SysFsError = { code: 'cell/push', message: `File not loaded` };
        return { ...res, error };
      }

      const bytes = read.file.bytes ?? -1;
      const hash = read.file.hash;
      const data = read.file?.data.buffer;
      const payload: t.IHttpClientCellFileUpload = { filename: path, data };

      return { path, hash, bytes, payload };
    };

    try {
      const address = CellAddress.parse(e.address);
      if (address.error) {
        const message = address.error;
        const error: t.SysFsError = { code: 'cell/push', message };
        return fail(error);
      }

      const getPaths = async (path: string): Promise<string[]> => {
        const info = await fs.info(PathUri.ensurePrefix(path));
        if (info.kind === 'unknown') return [];
        if (info.kind === 'file') return [info.path];
        const manifest = await index.manifest({ dir: path });
        const paths = manifest.files.map((file) => Path.join(fs.dir, file.path));
        return paths;
      };

      /**
       * Prepare upload.
       */
      const paths = R.flatten(await Promise.all(asArray(e.path ?? '').map(getPaths)));
      const uploads = await Promise.all(paths.map(prepareUpload));
      const payload = uploads
        .map((item) => item.payload)
        .filter(Boolean) as t.IHttpClientCellFileUpload[];

      type R = t.SysFsPushedFile;
      const files: R[] = uploads.map(({ path, bytes, hash }) => ({ path, hash, bytes }));

      if (files.length === 0) {
        const sources = asArray(e.path ?? '').map(trimRootDir);
        const errors: t.SysFsError[] = sources.map((path) => {
          const message = `No files to push from source: ${path}`;
          return { code: 'cell/push', message, path };
        });
        return fail(...errors);
      }

      /**
       * Perform upload.
       */
      const http = args.httpFactory(address.domain);
      const res = await http.cell(address.uri).fs.upload(payload);
      http.dispose();

      /**
       * Finish up.
       */
      if (res.body.errors.length > 0) {
        const errors = res.body.errors
          .map((item) => `[${item.status}] ${item.message}`)
          .map((message) => ({ code: 'cell/push', message } as t.SysFsError));
        return done({ errors, files });
      } else {
        return done({ files });
      }
    } catch (err) {
      const message = err.message;
      return fail({ code: 'cell/push', message });
    }
  });

  /**
   * Pull
   */
  events.remote.pull.req$.subscribe(async (e) => {
    const { tx } = e;

    const fail = (...errors: t.SysFsError[]) => done({ errors });
    const done = (args: { errors?: (t.SysFsError | undefined)[]; files?: t.SysFsPushedFile[] }) => {
      const { files = [] } = args;
      const errors = (args.errors ?? []).filter(Boolean) as t.SysFsError[];
      const ok = errors.length === 0;
      bus.fire({
        type: 'sys.fs/cell/pull:res',
        payload: { ok, tx, id, files, errors },
      });
    };

    const toFilter = (path: string): string | undefined => {
      path = Path.trim(path);
      if (!path) return undefined;
      if (path.endsWith('/')) {
        path = Path.trimWildcardEnd(path);
        path = Path.trimSlashesEnd(path);
        path = `${path}/**/*`;
      }
      return path;
    };

    try {
      const address = CellAddress.parse(e.address);
      if (address.error) {
        const message = address.error;
        const error: t.SysFsError = { code: 'cell/pull', message };
        return fail(error);
      }

      /**
       * Format the query filters from the given path(s).
       */
      let filters = asArray(e.path ?? []).map(toFilter);
      if (filters.length === 0) filters = [''];

      /**
       * Derive the file download list.
       */
      const client = args.httpFactory(address.domain);
      const http = client.cell(address.uri);

      type L = { list: t.IHttpClientFileData[]; error?: t.SysFsError };
      const getList = async (filter?: string): Promise<L> => {
        const res = await http.fs.list({ filter });
        if (!res.ok) {
          const message = `Failed while retriving file list. ${res.error?.message ?? ''}`.trim();
          return { list: [], error: { code: 'cell/pull', message, path: filter } };
        }
        return { list: res.body };
      };

      const lists = await Promise.all(filters.map(getList));
      const paths = R.uniq(R.flatten(lists.map(({ list }) => list.map((item) => item.path))));

      /**
       * Perform download
       */
      type P = { file: t.SysFsPulledFile; error?: t.SysFsError };
      const pull = async (path: string): Promise<P> => {
        path = trimRootDir(path);
        const res: P = { file: { path, hash: '', bytes: -1 } };

        const done = (options: { error?: string } = {}) => {
          if (options.error) res.error = { code: 'cell/pull', message: options.error, path };
          return res;
        };

        const info = await http.fs.file(path).info();

        if (!info.ok) {
          const message = info.error?.message ?? '';
          const error = `Failed while retriving file info. ${message}`.trim();
          return done({ error });
        }
        res.file.hash = info.body.data.hash ?? '';
        res.file.bytes = info.body.data.props.bytes ?? -1;

        const download = await http.fs.file(path).download();

        if (download.ok) {
          const uri = PathUri.ensurePrefix(path);
          const data = download.body as unknown as Uint8Array;
          const save = await fs.write(uri, data);
          if (!save.ok) {
            const message = save.error?.message ?? '';
            const error = `Failed while saving downloaded file. ${message}`.trim();
            return done({ error });
          }
        } else {
          const message = download.error?.message ?? '';
          const error = `Failed to download file. ${message}`.trim();
          return done({ error });
        }

        return res;
      };

      const pulled = await Promise.all(paths.map(pull));
      const files = pulled.map(({ file }) => file);
      const errors = pulled.map(({ error }) => error);

      /**
       * Finish up.
       */
      client.dispose();
      done({ files, errors });
    } catch (err) {
      const message = err.message;
      return fail({ code: 'cell/pull', message });
    }
  });
}
