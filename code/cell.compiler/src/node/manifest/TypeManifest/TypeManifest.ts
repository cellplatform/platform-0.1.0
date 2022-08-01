import { fs, t } from '../../common';
import { FileInfo } from './FileInfo';
import { CreateAndSave } from './types';
import { formatDirs, Info } from './Util';
import { Manifest, createAndSave as ManifestCreateAndSave } from '../Manifest';

type M = t.TypelibManifest;

const createAndSave: CreateAndSave = async (args) => {
  const { model, base, dir, filename, info } = args;
  const dirs = formatDirs(args.base, args.dir);
  const res = await ManifestCreateAndSave<M>({
    create: () => TypeManifest.create({ base, dir, model, filename, info }),
    dir: dirs.join(),
    filename,
    model,
  });
  return res;
};

/**
 * Helpers for creating and working with manifest of type declarations (".d.ts" files)
 */
export const TypeManifest = {
  file: FileInfo,
  hash: Manifest.hash,
  validate: Manifest.validate,

  /**
   * The filename of the bundle.
   */
  filename: Manifest.filename,

  /**
   * Generates a manifest.
   */
  async create(args: {
    base: string;
    dir: string;
    filename?: string; // Default: index.json
    model?: t.CompilerModel;
    saveRefs?: boolean;
    info?: t.TypelibManifestInfo;
  }): Promise<M> {
    const { base, dir, model, filename = TypeManifest.filename } = args;
    const dirs = formatDirs(args.base, args.dir);
    const manifest = await Manifest.create({
      dir: dirs.join(),
      filename,
      model,
    });

    let typelib: t.TypelibManifestInfo = { name: '', version: '', entry: '' };
    if (typeof args.info === 'object') typelib = args.info;

    return {
      hash: manifest.hash,
      kind: 'typelib',
      typelib,
      files: await Promise.all(
        manifest.files.map((file) => FileInfo.appendManifest(dirs.join(), file)),
      ),
    };
  },

  /**
   * Write the bundle manifest to the file-sy stem.
   */
  createAndSave,

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
    const res = await Manifest.write<M>(args);
    return res;
  },

  /**
   * Loads [typelib] info from the [package.json] found via the given path (directory of full path).
   */
  async info(path?: string) {
    const empty = Info.empty;
    if (!path) return empty;
    if (path.endsWith('.json')) return (await Info.loadFile(path)) || empty;
    if (!(await fs.is.dir(path))) path = fs.dirname(path);
    if (await fs.is.dir(path)) return (await Info.find(path)) || empty;
    return empty;
  },
};
