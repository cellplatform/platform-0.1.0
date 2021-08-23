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

  /**
   * Push
   */
  events.remote.push.req$.subscribe(async (e) => {
    const { tx } = e;

    const done = (options: { errors?: t.SysFsFileError[]; files?: t.SysFsPushedFile[] }) => {
      const { errors = [], files = [] } = options;
      bus.fire({
        type: 'sys.fs/cell/push:res',
        payload: { tx, id, files, errors },
      });
    };

    const fail = (...errors: t.SysFsFileError[]) => done({ errors });
    const trimRootDir = (path: string) =>
      path.startsWith(fs.dir) ? path.substring(fs.dir.length) : path;

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
        const error: t.SysFsFileError = { code: 'cell/push', message, path: '' };
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

      // Prepare upload.
      const paths = R.flatten(await Promise.all(asArray(e.path).map(getPaths)));
      const uploads = await Promise.all(paths.map(prepareUpload));
      const payload = uploads
        .map((item) => item.payload)
        .filter(Boolean) as t.IHttpClientCellFileUpload[];

      type R = t.SysFsPushedFile;
      const files: R[] = uploads.map(({ path, bytes, hash }) => ({ path, hash, bytes }));

      if (files.length === 0) {
        const sources = asArray(e.path).map(trimRootDir);
        const errors: t.SysFsFileError[] = sources.map((path) => {
          const message = `No files to push from source: ${path}`;
          return { code: 'cell/push', message, path };
        });
        return fail(...errors);
      }

      // Perform upload.
      const http = args.httpFactory(address.domain);
      const res = await http.cell(address.uri).fs.upload(payload);
      http.dispose();

      // Finish up.
      if (res.body.errors.length > 0) {
        const errors = res.body.errors
          .map((item) => `[${item.status}] ${item.message}`)
          .map((message) => ({ code: 'cell/push', message, path: '' } as t.SysFsFileError));
        return done({ errors, files });
      } else {
        return done({ files });
      }
    } catch (err) {
      const message = err.message;
      return fail({ code: 'cell/push', message, path: '' });
    }
  });
}
