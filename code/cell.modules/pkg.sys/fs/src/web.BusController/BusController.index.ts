import { asArray, join, t, R, DEFAULT } from './common';

type FilesystemId = string;
type Error = t.SysFsError;

/**
 * Event controller.
 */
export function BusControllerIndex(args: {
  id: FilesystemId;
  fs: t.IFsLocal;
  bus: t.EventBus<t.SysFsEvent>;
  index: t.FsIndexer;
  events: t.SysFsEvents;
}) {
  const { id, fs, bus, events, index } = args;

  /**
   * Manifest.
   */
  events.index.manifest.req$.subscribe(async (e) => {
    const { tx } = e;

    const toManifest = async (path?: string): Promise<t.SysFsManifestDirResponse> => {
      const dir = path ? join(fs.dir, path) : fs.dir;
      try {
        const manifest = await index.manifest({ dir: path });
        return { dir, manifest };
      } catch (error) {
        const message = `Failed while building manifest. ${error.message}`.trim();
        return {
          dir,
          manifest: R.clone(DEFAULT.ERROR_MANIFEST),
          error: { code: 'manifest', message },
        };
      }
    };

    const paths = R.uniq(asArray(e.dir ?? []).map((path) => (path || '').trim() || '/'));
    const dirs = await Promise.all(paths.length === 0 ? [toManifest()] : paths.map(toManifest));

    bus.fire({
      type: 'sys.fs/manifest:res',
      payload: { tx, id, dirs },
    });
  });
}
