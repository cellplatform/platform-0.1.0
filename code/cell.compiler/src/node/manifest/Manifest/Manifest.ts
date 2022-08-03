import { deleteUndefined, fs, t, DEFAULT, ManifestFile, ManifestHash } from '../../common';
import { FileAccess } from '../../Config';

type M = t.Manifest;

/**
 * Create and write a new manifest to the file-system.
 */
export const createAndSave = async <T extends M>(args: {
  create: () => Promise<T>;
  dir: string;
  filename?: string;
  model?: t.CompilerModel;
}) => {
  const { model, dir, filename } = args;
  const manifest = await args.create();
  return write<T>({ manifest, dir, filename });
};

/**
 * Reads from file-system.
 */
const read = async <T extends M>(args: { dir: string; filename?: string }) => {
  const { dir, filename = Manifest.filename } = args;
  const path = fs.join(dir, filename);
  const exists = await fs.pathExists(path);
  const manifest = exists ? ((await fs.readJson(path)) as T) : undefined;
  return { path, manifest };
};

/**
 * Writes a manifest to the file-system.
 */
const write = async <T extends M>(args: { manifest: T; dir: string; filename?: string }) => {
  const { manifest, dir, filename = Manifest.filename } = args;
  const path = fs.join(dir, filename);
  const json = JSON.stringify(manifest, null, '  ');
  await fs.ensureDir(fs.dirname(path));
  await fs.writeFile(path, json);
  return { path, manifest };
};

/**
 * Helpers for creating and working with a [FileManifest].
 */
export const Manifest = {
  read,
  write,

  /**
   * The filename of the bundle.
   */
  filename: DEFAULT.FILE.JSON.MANIFEST,

  /**
   * Generates a manifest.
   */
  async create<T extends M>(args: {
    dir: string;
    model?: t.CompilerModel;
    filename?: string; // Default: index.json
  }) {
    const { model, filename = Manifest.filename } = args;
    const sourceDir = (args.dir || '').trim().replace(/\/*$/, '');
    const pattern = `${args.dir}/**`;

    let paths = await fs.glob.find(pattern, { includeDirs: false });
    paths = paths.filter((path) => path.substring(sourceDir.length + 1) !== filename);

    const toFile = (path: string) => Manifest.loadFile({ path, baseDir: sourceDir, model });
    const files: t.ManifestFile[] = await Promise.all(paths.map((path) => toFile(path)));

    const hash: t.ManifestHash = {
      files: Manifest.hash.files(files),
    };

    const manifest: M = { hash, files };
    return manifest as T;
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: { dir: string; filename?: string; model?: t.CompilerModel }) {
    const { dir, filename, model } = args;
    return createAndSave<M>({
      create: () => Manifest.create({ dir, model, filename }),
      dir,
      filename,
      model,
    });
  },

  /**
   * Tools for working with hash checksums of a manifest.
   */
  hash: {
    files(input: t.ManifestFile[] | t.Manifest) {
      return ManifestHash.files(input);
    },

    module(info: t.ModuleManifestInfo, files: t.ManifestFile[]): t.ModuleManifestHash {
      return ManifestHash.module(info, files);
    },

    /**
     * Calculate the hash of a file.
     */
    async filehash(path: string) {
      return ManifestFile.Hash.filehash(fs, path);
    },
  },

  /**
   * Check a manifest against the current state of the file-system.
   * Looks for:
   *  - filehash mismatches.
   *  - changes to the list of files.
   */
  async validate(dir: string, manifest: t.Manifest): Promise<t.ManifestValidation> {
    dir = fs.resolve(dir);
    const res: t.ManifestValidation = { ok: true, dir, errors: [] };

    // Compare file listing.
    let list = await fs.glob.find(`${dir}/**/*`);
    list = list
      .map((path) => path.substring(dir.length + 1))
      .filter((path) => path !== Manifest.filename);

    if (list.length !== manifest.files.length) {
      const added = list.filter((path) => !manifest.files.find((f) => f.path === path));
      const removed = manifest.files.filter((file) => !list.find((p) => p === file.path));
      const addError = (path: string, message: string) => {
        res.errors.push({
          message,
          path,
          hash: { manifest: '-', filesystem: '-' },
        });
      };

      removed.forEach((file) => {
        const message = `A file within the manifest has been removed from the file-system`;
        addError(file.path, message);
      });

      added.forEach((path) => {
        const message = `A file not within the manifest has been added to the file-system`;
        addError(path, message);
      });
    }

    // Compare file-hash checksums.
    await Promise.all(
      manifest.files.map(async (file) => {
        const path = fs.join(dir, file.path);
        if (await fs.pathExists(path)) {
          const filesystem = await Manifest.hash.filehash(path);
          if (filesystem !== file.filehash) {
            res.errors.push({
              message: `Filehash mismatch`,
              path: path.substring(dir.length + 1),
              hash: { manifest: file.filehash, filesystem },
            });
          }
        }
      }),
    );

    // Finish up.
    res.ok = res.errors.length === 0;
    return res;
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
    const path = args.path.substring(baseDir.length + 1);
    return deleteUndefined({
      ...(await ManifestFile.parse({ fs, baseDir, path: args.path })),
      public: model ? toPublic({ model, path }) : undefined,
      image: await Manifest.toImage(path),
    });
  },

  /**
   * Generates image meta-data for the given path.
   */
  async toImage(path: string): Promise<t.ManifestFileImage | undefined> {
    return ManifestFile.Image.parse(fs, path);
  },
};

/**
 * Helpers
 */

function toAccess(args: { model: t.CompilerModel; path: string }) {
  const access = FileAccess(args.model.files?.access);
  return access.path(args.path);
}

function toPublic(args: { model: t.CompilerModel; path: string }) {
  const access = toAccess(args);
  return access.public ? true : undefined;
}
