import { asArray, BusEvents, Format, rx, t } from './common';

type FilesystemId = string;
type Error = t.SysFsError;
type MaybeError = Error | undefined;
type FilePath = string;

/**
 * Event controller.
 */
export function BusController(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<any>;
  filter?: (e: t.SysFsEvent) => boolean;
}) {
  const { id, fs } = args;

  const bus = rx.busAsType<t.SysFsEvent>(args.bus);
  const events = BusEvents({ id, bus, filter: args.filter });
  const { dispose, dispose$ } = events;

  /**
   * Info (Module)
   */
  events.info.req$.subscribe(async (e) => {
    const { tx } = e;

    const info: t.SysFsInfo = {
      id,
      dir: fs.dir,
    };

    const getFileInfo = async (filepath: FilePath): Promise<t.SysFsFileInfo> => {
      try {
        const uri = Format.path.ensurePrefix(filepath);
        const res = await fs.info(uri);
        const { exists, hash, bytes } = res;
        const path = res.path.substring(fs.dir.length);
        return { path, exists, hash, bytes };
      } catch (err) {
        const error: t.SysFsError = { code: 'info', message: err.message };
        return { path: filepath, exists: null, hash: '', bytes: -1, error };
      }
    };

    const paths = asArray(e.path ?? []);
    const files = await Promise.all(paths.map(getFileInfo));

    bus.fire({
      type: 'sys.fs/info:res',
      payload: { tx, id, fs: info, files },
    });
  });

  /**
   * Read
   */
  events.io.read.req$.subscribe(async (e) => {
    const { tx } = e;

    const read = async (filepath: string): Promise<t.SysFsFileReadResponse> => {
      const address = Format.path.ensurePrefix(filepath);
      const res = await fs.read(address);

      if (res.error) {
        const error: Error = { code: 'read', message: res.error.message };
        return { error };
      }

      if (!res.file) {
        const error: Error = { code: 'read', message: `File not found. ${filepath}` };
        return { error };
      }

      const { hash, data } = res.file;
      const path = res.file.path;
      return {
        file: { path, data, hash },
      };
    };

    const files = await Promise.all(asArray(e.path).map(read));
    const error: MaybeError = files.some((file) => Boolean(file.error))
      ? { code: 'read', message: 'Failed while reading' }
      : undefined;

    bus.fire({
      type: 'sys.fs/read:res',
      payload: { tx, id, files, error },
    });
  });

  /**
   * Write
   */
  events.io.write.req$.subscribe(async (e) => {
    const { tx } = e;

    const writeFile = async (file: t.SysFsFile): Promise<t.SysFsFileWriteResponse> => {
      const { data } = file;
      const address = Format.path.ensurePrefix(file.path);
      const res = await fs.write(address, data);
      const error: MaybeError = res.error
        ? { code: 'write', message: res.error.message }
        : undefined;
      return {
        path: res.file.path.substring(fs.dir.length),
        error,
      };
    };

    const files = await Promise.all(asArray(e.file).map(writeFile));
    const error: MaybeError = files.some((file) => Boolean(file.error))
      ? { code: 'write', message: 'Failed while writing' }
      : undefined;

    bus.fire({
      type: 'sys.fs/write:res',
      payload: { tx, id, files, error },
    });
  });

  /**
   * Delete
   */
  events.io.delete.req$.subscribe(async (e) => {
    const { tx } = e;

    const deleteFile = async (filepath: FilePath): Promise<t.SysFsFileDeleteResponse> => {
      const address = Format.path.ensurePrefix(filepath);
      const res = await fs.delete(address);
      const error: MaybeError = res.error
        ? { code: 'delete', message: res.error.message }
        : undefined;
      const path = Format.file.trimPrefix(res.locations[0]).substring(fs.dir.length);
      return { path, error };
    };

    const files = await Promise.all(asArray(e.path).map(deleteFile));
    const error: MaybeError = files.some((file) => Boolean(file.error))
      ? { code: 'delete', message: 'Failed while deleting' }
      : undefined;

    bus.fire({
      type: 'sys.fs/delete:res',
      payload: { tx, id, files, error },
    });
  });

  return { id, dispose, dispose$ };
}
