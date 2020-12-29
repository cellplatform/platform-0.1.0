import { fs, t } from '../common';
import * as Manifest from './Manifest';
import { appendFileInfo } from './TypeManifest.appendInfo';
import { copyRefs } from './TypeManifest.copyRefs';
import { CreateAndSave } from './TypeManifest.types';

type M = t.TypelibManifest;
type Dirs = { base: string; dir: string; join(): string };

const createAndSave: CreateAndSave = async (args) => {
  const { model, base, dir, filename } = args;
  const dirs = formatDirs(args.base, args.dir);
  const res = await Manifest.createAndSave<M>({
    create: () => TypeManifest.create({ base, dir, model, filename }),
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
  }): Promise<M> {
    const { base, dir, model, filename = TypeManifest.filename } = args;
    const dirs = formatDirs(args.base, args.dir);
    const manifest = await Manifest.Manifest.create({
      sourceDir: dirs.join(),
      model,
      filename,
    });
    return {
      kind: 'typelib',
      hash: manifest.hash,
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
