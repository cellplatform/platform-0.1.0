import { DEFAULT, deleteUndefined, Model, Schema, t } from '../common';
import { FileAccess, FileRedirects } from '../config';
import { FileManifest } from './FileManifest';

type M = t.BundleManifest;

/**
 * Helpers for creating and working with a [BundleManifest].
 */
export const BundleManifest = {
  /**
   * The filename of the bundle.
   */
  filename: FileManifest.filename,

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
  async create(args: { model: t.CompilerModel; sourceDir: string }) {
    const { sourceDir, model } = args;
    const data = Model(model);
    const manifest = await FileManifest.create({ sourceDir, model });

    const REMOTE = DEFAULT.FILE.JS.REMOTE_ENTRY;
    const remoteEntry = manifest.files.some((file) => file.path.endsWith(REMOTE))
      ? REMOTE
      : undefined;

    const bundle: M['bundle'] = deleteUndefined({
      mode: data.mode(),
      target: data.target(),
      entry: data.entryFile,
      remoteEntry,
    });

    return { ...manifest, bundle } as M;
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: { model: t.CompilerModel; sourceDir: string; filename?: string }) {
    const { model, sourceDir, filename } = args;
    const manifest = await BundleManifest.create({ model, sourceDir });
    return BundleManifest.write({ manifest, dir: sourceDir, filename });
  },

  /**
   * Reads from file-system.
   */
  async read(args: { dir: string; filename?: string }) {
    return FileManifest.read<M>(args);
  },

  /**
   * Writes a manifest to the file-system.
   */
  async write(args: { manifest: t.BundleManifest; dir: string; filename?: string }) {
    return FileManifest.write<M>(args);
  },
};

/**
 * Helpers
 */

function toRedirect(args: { model: t.CompilerModel; path: string }) {
  const redirects = FileRedirects(args.model.files?.redirects);
  return redirects.path(args.path);
}

function toAccess(args: { model: t.CompilerModel; path: string }) {
  const access = FileAccess(args.model.files?.access);
  return access.path(args.path);
}

function toPublic(args: { model: t.CompilerModel; path: string }) {
  const access = toAccess(args);
  return access.public ? true : undefined;
}
