import { asArray, join, t } from './common';

type FilesystemId = string;
type Error = t.SysFsError;

/**
 * Event controller.
 */
export function BusControllerIndex(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<t.SysFsEvent>;
  index: t.FilesystemIndexer;
  events: t.SysFsEvents;
}) {
  const { id, fs, bus, events, index } = args;

  /**
   * Manifest.
   */
  events.index.manifest.req$.subscribe(async (e) => {
    const { tx } = e;

    const toManifest = async (path?: string) => {
      const manifest = await index.manifest({ dir: path });
      const dir = path ? join(fs.dir, path) : fs.dir;
      return { dir, manifest };
    };

    const paths = asArray(e.dir ?? []);
    const dirs =
      paths.length === 0 ? [await toManifest()] : await Promise.all(paths.map(toManifest));

    bus.fire({
      type: 'sys.fs/manifest:res',
      payload: { tx, id, dirs },
    });
  });
}
