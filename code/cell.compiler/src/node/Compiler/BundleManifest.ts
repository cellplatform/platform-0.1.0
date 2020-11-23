import { DEFAULT, fs, Model, Schema, t, value, Path } from '../common';

const REMOTE_ENTRY = DEFAULT.FILE.JS.REMOTE_ENTRY;
const MANIFEST = DEFAULT.FILE.JSON.MANIFEST;

export const BundleManifest = {
  /**
   * The filename of the bundle.
   */
  filename: MANIFEST,

  /**
   * URL to the manifest
   */
  url(host: string, uri: string, dir?: string) {
    return Schema.urls(host).func.manifest({ host, uri, dir });
  },

  /**
   * Generates a bundle manifest.
   */
  async create(args: { model: t.CompilerModel; bundleDir: string }) {
    const model = Model(args.model);
    const paths = await fs.glob.find(`${args.bundleDir}/**`, { includeDirs: false });

    const files: t.BundleManifestFile[] = await Promise.all(
      paths.map(async (path) => {
        const file = await fs.readFile(path);
        const bytes = file.byteLength;
        const filehash = Schema.hash.sha256(file);
        path = path.substring(args.bundleDir.length + 1);
        return { path, bytes, filehash };
      }),
    );

    const bytes = files.reduce((acc, next) => acc + next.bytes, 0);
    const hash = Schema.hash.sha256(files.map((file) => file.filehash));

    const manifest: t.BundleManifest = {
      hash,
      mode: model.mode(),
      target: model.target(),
      entry: model.entryFile,
      remoteEntry: paths.some((path) => path.endsWith(REMOTE_ENTRY)) ? REMOTE_ENTRY : undefined,
      bytes,
      files,
    };

    return value.deleteUndefined(manifest);
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: { model: t.CompilerModel; bundleDir: string; filename?: string }) {
    const { model, bundleDir, filename } = args;
    const manifest = await BundleManifest.create({ model, bundleDir });
    return BundleManifest.writeFile({ manifest, bundleDir, filename });
  },

  /**
   * Reads from file-system.
   */
  async readFile(args: { bundleDir: string; filename?: string }) {
    const { bundleDir, filename = MANIFEST } = args;
    const path = fs.join(bundleDir, filename);
    const exists = await fs.pathExists(path);
    const manifest = exists ? ((await fs.readJson(path)) as t.BundleManifest) : undefined;
    return { path, manifest };
  },

  /**
   * Writes a manifest to the file-system.
   */
  async writeFile(args: { manifest: t.BundleManifest; bundleDir: string; filename?: string }) {
    const { manifest, bundleDir, filename = MANIFEST } = args;
    const path = fs.join(bundleDir, filename);
    const json = JSON.stringify(manifest, null, '  ');
    await fs.writeFile(path, json);
    return { path, manifest };
  },
};
