import { deleteUndefined, fs, Schema, t, DEFAULT } from '../common';
import { FileAccess, FileRedirects } from '../config';

type M = t.Manifest;

/**
 * Create and write a new manifest to the file-system.
 */
export const createAndSave = async <T extends M>(args: {
  create: () => Promise<T>;
  sourceDir: string;
  filename?: string;
  model?: t.CompilerModel;
}) => {
  const { model, sourceDir, filename } = args;
  const manifest = await args.create();
  return write<T>({ manifest, dir: sourceDir, filename });
};

/**
 * Reads from file-system.
 */
const read = async <T extends M>(args: { dir: string; filename?: string }) => {
  const { dir, filename = FileManifest.filename } = args;
  const path = fs.join(dir, filename);
  const exists = await fs.pathExists(path);
  const manifest = exists ? ((await fs.readJson(path)) as T) : undefined;
  return { path, manifest };
};

/**
 * Writes a manifest to the file-system.
 */
const write = async <T extends M>(args: { manifest: T; dir: string; filename?: string }) => {
  const { manifest, dir, filename = FileManifest.filename } = args;
  const path = fs.join(dir, filename);
  const json = JSON.stringify(manifest, null, '  ');
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, json);
  return { path, manifest };
};

/**
 * Helpers for creating and working with a [FileManifest].
 */
export const FileManifest = {
  read,
  write,

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: { sourceDir: string; filename?: string; model?: t.CompilerModel }) {
    const { sourceDir, filename, model } = args;
    return createAndSave<M>({
      create: () => FileManifest.create({ sourceDir, model, filename }),
      sourceDir,
      filename,
      model,
    });
  },

  /**
   * The filename of the bundle.
   */
  filename: DEFAULT.FILE.JSON.MANIFEST,

  /**
   * Generates a manifest.
   */
  async create<T extends M>(args: {
    sourceDir: string;
    model?: t.CompilerModel;
    filename?: string; // Default: index.json
  }) {
    const { model, filename = FileManifest.filename } = args;
    const sourceDir = (args.sourceDir || '').trim().replace(/\/*$/, '');
    const pattern = `${args.sourceDir}/**`;

    let paths = await fs.glob.find(pattern, { includeDirs: false });
    paths = paths.filter((path) => !path.endsWith(`/${filename}`));

    const toFile = (path: string) => FileManifest.loadFile({ path, baseDir: sourceDir, model });
    const files: t.ManifestFile[] = await Promise.all(paths.map((path) => toFile(path)));

    const manifest: M = {
      hash: FileManifest.hash(files),
      files,
    };

    return manifest as T;
  },

  /**
   * Calculate the hash for a set of fies.
   */
  hash(files: t.ManifestFile[]) {
    const list = files.filter(Boolean).map((file) => file.filehash);
    return Schema.hash.sha256(list);
  },

  /**
   * Loads the file as the given path and derives file metadata.
   */
  async loadFile(args: {
    baseDir: string;
    path: string;
    model?: t.CompilerModel;
  }): Promise<t.ManifestFile> {
    const { model, baseDir } = args;
    const file = await fs.readFile(args.path);
    const bytes = file.byteLength;
    const filehash = Schema.hash.sha256(file);
    const path = args.path.substring(baseDir.length + 1);
    return deleteUndefined({
      path,
      bytes,
      filehash,
      allowRedirect: model ? toRedirect({ model, path }).flag : undefined,
      public: model ? toPublic({ model, path }) : undefined,
    });
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
