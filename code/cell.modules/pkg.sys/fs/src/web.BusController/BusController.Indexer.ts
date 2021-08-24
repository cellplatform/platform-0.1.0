import { asArray, Path, t, R, DEFAULT } from './common';
import { ManifestCache } from './ManifestCache';
import { Format } from './Format';

type FilesystemId = string;

/**
 * Event controller.
 */
export function BusControllerIndexer(args: {
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
    const cachefile = Path.trim(e.cachefile ?? DEFAULT.CACHE_FILENAME);

    const filterCachefile: t.FsPathFilter = (e) => {
      return !e.path.endsWith(DEFAULT.CACHE_FILENAME) || !e.path.endsWith(cachefile);
    };

    const toErrorResponse = (dir: string, error: string): t.SysFsManifestDirResponse => {
      const message = `Failed while building manifest. ${error ?? ''}`.trim();
      return {
        dir,
        manifest: R.clone(DEFAULT.ERROR_MANIFEST),
        error: { code: 'manifest', message },
      };
    };

    const toManifest = async (path?: string): Promise<t.SysFsManifestDirResponse> => {
      const dir = Format.dir.ensureTrailingSlash(path ? Path.join(fs.dir, path) : fs.dir);
      const cache = ManifestCache({ fs, dir, filename: cachefile });
      try {
        if (e.cache === true) {
          const manifest = await cache.read();
          if (manifest) return { dir, manifest };
        }

        const manifest = await index.manifest({ dir: path, filter: filterCachefile });

        if ((e.cache === true || e.cache === 'force') && (await cache.dirExists())) {
          await cache.write(manifest);
        }

        return { dir, manifest };
      } catch (error) {
        return toErrorResponse(dir, error.message);
      }
    };

    const paths = R.uniq(asArray(e.dir ?? []).map((path) => (path || '').trim() || '/'));
    const dirs = await Promise.all(paths.length === 0 ? [toManifest()] : paths.map(toManifest));

    const hasError = dirs.some((dir) => dir.error);
    const error: t.SysFsError | undefined = hasError
      ? { code: 'manifest', message: `Indexing failed` }
      : undefined;

    bus.fire({
      type: 'sys.fs/manifest:res',
      payload: { tx, id, dirs, error },
    });
  });
}
