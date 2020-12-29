import { fs, t } from '../../common';
import * as Manifest from '../Manifest';
import { appendFileInfo } from './appendInfo';
import { copyRefs } from './copyRefs';
import { CreateAndSave } from './types';
import { Info } from './util';

type M = t.TypelibManifest;
type Dirs = { base: string; dir: string; join(): string };

const createAndSave: CreateAndSave = async (args) => {
  const { model, base, dir, filename, info } = args;
  const dirs = formatDirs(args.base, args.dir);
  const res = await Manifest.createAndSave<M>({
    create: () => TypeManifest.create({ base, dir, model, filename, info }),
    sourceDir: dirs.join(),
    filename,
    model,
  });
  if (args.copyRefs) await copyRefs(base, res.manifest, createAndSave);
  return res;
};

/**
 * Helpers for creating and working with manifest of type declarations (".d.ts" files)
 */
export const TypeManifest = {
  /**
   * The filename of the bundle.
   */
  filename: Manifest.Manifest.filename,

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
    const manifest = await Manifest.Manifest.create({
      sourceDir: dirs.join(),
      filename,
      model,
    });

    let typelib: t.TypelibManifestInfo = { name: '', version: '', entry: '' };
    if (typeof args.info === 'object') typelib = args.info;

    return {
      hash: manifest.hash,
      kind: 'typelib',
      typelib,
      files: await Promise.all(manifest.files.map((file) => appendFileInfo(dirs.join(), file))),
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
    return Manifest.Manifest.read<M>(args);
  },

  /**
   * Writes a manifest to the file-system.
   */
  async write(args: { manifest: M; dir: string; filename?: string; copyRefs?: boolean }) {
    const res = await Manifest.Manifest.write<M>(args);
    if (args.copyRefs) await copyRefs(fs.dirname(args.dir), res.manifest, createAndSave);
    return res;
  },

  /**
   * Loads [typelib] info from the [package.json] found via the given path.
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

/**
 * Helpers
 */

export function formatDirs(base: string, dir: string): Dirs {
  base = fs.resolve((base || '').trim()).replace(/\/*$/, '');
  dir = (dir || '').trim().replace(/\/*$/, '');
  dir = dir.startsWith(base) ? (dir = dir.substring(base.length + 1)) : dir;
  dir = dir.replace(/^\/*/, '');
  return { base, dir, join: () => fs.join(base, dir) };
}
