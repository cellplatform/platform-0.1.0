import { Hash, Path, PathUri, t } from './common';

/**
 * High level [Fs] interface for programming against the file-system.
 */
export function BusEventsFs(args: {
  subdir?: string;
  index: t.SysFsEventsIndex;
  io: t.SysFsEventsIo;
  toUint8Array: t.SysFsAsUint8Array;
}): t.Fs {
  const { io, index, toUint8Array } = args;
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
    const first = res.files[0];

    if (first.error?.code === 'read/404') return undefined;
    if (first.error) throw new Error(first.error.message);
    if (res.error) throw new Error(res.error.message);

    return first.file?.data ?? undefined;
  };

  /**
   * Write a file.
   */
  const write: t.Fs['write'] = async (path, input) => {
    path = formatPath(path);
    const data = await toUint8Array(input);
    const hash = Hash.sha256(data);
    const bytes = data.byteLength;

    const res = await io.write.fire({ path, hash, data });
    if (res.error) {
      throw new Error(res.error.message);
    }

    return {
      hash,
      bytes,
    };
  };

  /**
   * Copy a file.
   */
  const copy: t.Fs['copy'] = async (source, target) => {
    source = formatPath(source);
    target = formatPath(target);
    const res = await io.copy.fire({ source, target });
    if (res.error) {
      throw new Error(res.error.message);
    }
  };

  /**
   * Move a file (copy + delete).
   */
  const move: t.Fs['move'] = async (source, target) => {
    source = formatPath(source);
    target = formatPath(target);
    const res = await io.move.fire({ source, target });
    if (res.error) {
      throw new Error(res.error.message);
    }
  };

  /**
   * API
   */
  return { exists, read, write, copy, move };
}
