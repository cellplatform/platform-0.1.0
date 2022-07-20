import { constants, DEFAULT, Encoding, Model, Schema, t, time, ManifestHash } from '../../common';
import { createAndSave, Manifest } from '../Manifest';

type M = t.ModuleManifest;
type Timestamp = number;

/**
 * Helpers for creating and working with a [ModuleManifest].
 */
export const ModuleManifest = {
  validate: Manifest.validate,

  /**
   * Tools for working with hash checksums of a manifest.
   */
  hash: Manifest.hash,

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
    dir: string;
    filename?: string; // Default: index.json
    compiledAt?: Timestamp;
  }): Promise<M> {
    const {
      dir,
      model,
      filename = ModuleManifest.filename,
      compiledAt = time.now.timestamp,
    } = args;

    const pkg = constants.COMPILER.load();
    const data = Model(model);
    const manifest = await Manifest.create({ dir, model, filename });
    const { files } = manifest;

    const version = data.version();
    const namespace = data.namespace();
    if (!namespace) throw new Error(`A bundle 'namespace' is required to create a manifest.`);

    const module: t.ModuleManifestInfo = {
      namespace,
      version,
      compiler: `${pkg.name}@${pkg.version || '0.0.0'}`,
      compiledAt,
      mode: data.mode(),
      target: data.target(),
      entry: data.entryFile,
    };

    if (model.exposes) {
      module.remote = {
        entry: DEFAULT.FILE.ENTRY.REMOTE,
        exports: Object.keys(model.exposes).map((key) => ({ path: Encoding.unescapePath(key) })),
      };
    }

    const hash = ManifestHash.module(module, files);
    return { kind: 'module', hash, module, files };
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: {
    model: t.CompilerModel;
    dir: string;
    filename?: string; // Default: index.json
  }) {
    const { model, dir, filename } = args;
    return createAndSave<M>({
      create: () => ModuleManifest.create({ dir, model, filename }),
      dir,
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
