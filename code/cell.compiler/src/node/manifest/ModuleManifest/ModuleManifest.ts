import { DEFAULT, deleteUndefined, Model, Schema, t, constants } from '../../common';
import { Manifest, createAndSave } from '../Manifest';

type M = t.ModuleManifest;

/**
 * Helpers for creating and working with a [ModuleManifest].
 */
export const ModuleManifest = {
  validate: Manifest.validate,

  /**
   * Tools for working with hash checksums of a manifest.
   */
  hash: {
    ...Manifest.hash,

    /**
     * Calculates the complete module hash, being the:
     *  1. hash of all files, PLUS
     *  2. the hash of the "module" meta-data object.
     */
    module(input: t.ModuleManifest) {
      const files = Manifest.hash.files(input.files);
      const module = input.module;
      return Schema.hash.sha256({ module, files });
    },
  },

  /**
   * The filename of the bundle.
   */
  filename: Manifest.filename,

  /**
   * URL to the manifest
   */
  url(host: string, uri: string, dir?: string) {
    const urls = Schema.urls(host);
    return urls.fn.bundle.manifest({ host, uri, dir });
  },

  /**
   * Generates a manifest.
   */
  async create(args: {
    model: t.CompilerModel;
    sourceDir: string;
    filename?: string; // Default: index.json
  }): Promise<M> {
    const { sourceDir, model, filename = ModuleManifest.filename } = args;

    const pkg = constants.PKG.load();
    const data = Model(model);
    const manifest = await Manifest.create({ sourceDir, model, filename });
    const { files } = manifest;

    const version = data.version();
    const namespace = data.namespace();
    if (!namespace) throw new Error(`A bundle 'namespace' is required to create a manifest.`);

    const REMOTE = DEFAULT.FILE.JS.REMOTE_ENTRY;
    const remoteEntry = files.some((file) => file.path.endsWith(REMOTE)) ? REMOTE : undefined;

    const module: t.ModuleManifestInfo = deleteUndefined({
      namespace,
      version,
      compiler: `${pkg.name}@${pkg.version ?? '0.0.0'}`,
      mode: data.mode(),
      target: data.target(),
      entry: data.entryFile,
      remoteEntry,
    });

    const hash: t.ModuleManifestHash = {
      files: manifest.hash.files,
      module: Schema.hash.sha256({ module, files: manifest.hash.files }),
    };

    return {
      hash,
      kind: 'module',
      module,
      files,
    };
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: {
    model: t.CompilerModel;
    sourceDir: string;
    filename?: string; // Default: index.json
  }) {
    const { model, sourceDir, filename } = args;
    return createAndSave<M>({
      create: () => ModuleManifest.create({ sourceDir, model, filename }),
      sourceDir,
      filename,
      model,
    });
  },

  /**
   * Reads from file-system.
   */
  async read(args: { dir: string; filename?: string }) {
    return Manifest.read<M>(args);
  },

  /**
   * Writes a manifest to the file-system.
   */
  async write(args: { manifest: M; dir: string; filename?: string }) {
    return Manifest.write<M>(args);
  },
};
