import { Hash, BusEvents, DEFAULT, rx, slug, t, asArray } from './common';

type FilesystemId = string;
type Error = t.SysFsError;
type MaybeError = Error | undefined;

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
  events.info.req$.subscribe((e) => {
    const { tx = slug() } = e;

    const info: t.SysFsInfo = {
      id,
      dir: fs.dir,
    };

    bus.fire({
      type: 'sys.fs/info:res',
      payload: { tx, id, info },
    });
  });

  /**
   * Read
   */
  events.io.read.req$.subscribe(async (e) => {
    const { tx } = e;

    const read = async (filepath: string): Promise<t.SysFsFileReadResponse> => {
      const { address } = formatPath(filepath);
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

    const write = async (file: t.SysFsFile): Promise<t.SysFsFileWriteResponse> => {
      const { data } = file;
      const { address } = formatPath(file.path);
      const res = await fs.write(address, data);
      const error: MaybeError = res.error
        ? { code: 'write', message: res.error.message }
        : undefined;
      return {
        path: res.file.path.substring(fs.dir.length),
        error,
      };
    };

    const files = await Promise.all(asArray(e.file).map(write));
    const error: MaybeError = files.some((file) => Boolean(file.error))
      ? { code: 'write', message: 'Failed while writing' }
      : undefined;

    bus.fire({
      type: 'sys.fs/write:res',
      payload: { tx, id, files, error },
    });
  });

  return { dispose, dispose$ };
}

/**
 * Helpers
 */

function formatPath(input: string) {
  const path = (input ?? '').trim().replace(/^path\:/, '');
  const address = `path:${path}`;
  return { path, address };
}
