import { Path, PathUri, CellAddress, rx, slug, t, timeoutWrangler, Hash } from './common';

/**
 * High level [Fs] interface for programming against the file-system.
 */
export function BusEventsFs(args: {
  subdir?: string;
  index: t.SysFsEventsIndex;
  io: t.SysFsEventsIo;
}): t.Fs {
  const { io, index } = args;
  const subdir = Path.trim(args.subdir) ?? '';

  // Path.
  const formatPath = (path: string) => {
    path = Path.trim(path);
    path = PathUri.trimPrefix(path);
    path = Path.join(subdir, path);
    path = Path.trimSlashesStart(path);
    return path;
  };

  /**
   * Determine if file/directory exists.
   */
  const exists: t.Fs['exists'] = async (path) => {
    if (typeof path !== 'string') return false;
    path = formatPath(path);

    // TEMP 🐷
    const info = await io.info.get({ path });
    // console.log('info', info);

    return path ? (await io.info.get({ path })).files[0].exists ?? false : false;
  };

  /**
   * Read a file.
   */
  const read: t.Fs['read'] = async (path) => {
    path = formatPath(path);
    const uri = PathUri.ensurePrefix(path);
    const res = await io.read.get(uri);
    const file = res.files[0];

    if (file.error?.code === 'read/404') return undefined;
    if (file.error) throw new Error(file.error.message);
    if (res.error) throw new Error(res.error.message);

    return file.file?.data ?? undefined;
  };

  /**
   * Write a file.
   */
  const write: t.Fs['write'] = async (path, input) => {
    if (input === undefined || input === null) {
      throw new Error(`No data`);
    }

    path = formatPath(path);
    const data = toBinary(input);
    const hash = Hash.sha256(data);
    const bytes = data.byteLength;

    const res = await io.write.fire({ path, hash, data });
    if (res.error) {
      throw new Error(res.error.message);
    }

    return { hash, bytes };
  };

  return { read, write, exists };
}

/**
 * Helpers
 */

function toBinary(input: string | Uint8Array | ArrayBuffer): Uint8Array {
  if (typeof input === 'string') return new TextEncoder().encode(input);
  return input as Uint8Array;
}
