import { fs, ManifestSource, ManifestUrl, Paths, slug, t } from '../common';
import { uploadFromLocal } from './Controller.fs.upload.fromLocal';

type Uri = string;
type Directory = string;

/**
 * Upload files from the given remote location.
 */
export async function uploadFromRemote(args: {
  httpFactory: (host: string) => t.IHttpClient;
  source: t.ManifestSource;
  manifest: t.ModuleManifest;
  target: { host: string; cell: Uri; dir: Directory };
  silent?: boolean;
}) {
  const { target, manifest, silent, httpFactory } = args;
  const tmp = fs.join(Paths.tmp, `copy.${slug()}`);
  const url = ManifestUrl.parse(args.source.toString());

  const http = httpFactory(url.domain);
  const httpSourceCell = http.cell(url.cell);

  const prefixPath = (path: string) => (url.dir ? fs.join(url.dir, path) : path);
  const writeFile = async (path: string, data: ReadableStream<any> | t.Json) => {
    path = fs.join(tmp, path);
    await fs.ensureDir(fs.dirname(path));
    await fs.stream.save(path, data);
  };

  /**
   * Download remote files and save locally.
   */
  await Promise.all(
    manifest.files.map(async (item) => {
      const path = prefixPath(item.path);
      const file = await httpSourceCell.fs.file(path).download();
      await writeFile(path, file.body);
    }),
  );

  /**
   * Save the manifest and upload to target.
   */
  const manifestPath = prefixPath('index.json');
  await writeFile(manifestPath, manifest);
  const source = ManifestSource(fs.join(tmp, manifestPath));
  const res = await uploadFromLocal({ httpFactory, source, target, silent });

  // Finish up.
  http.dispose();
  await fs.remove(tmp);
  return res;
}
