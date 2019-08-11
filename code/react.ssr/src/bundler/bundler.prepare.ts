import { jsYaml, constants, fs, Listr, log, S3, time, util, t } from '../common';
// import * as bundleManifest from './bundleManifest';

/**
 * Prepares a bundle for publishing.
 */
export async function prepare(args: { bundleDir: string }) {
  const dir = fs.resolve(args.bundleDir);
  if (!(await fs.pathExists(dir))) {
    throw new Error(`Cannot prepare, the directory does not exist. ${dir}`);
  }

  // Write a YAML file describing the contents of the bundle.
  const path = fs.join(dir, constants.PATH.BUNDLE_MANIFEST);
  const manifest = await bundleManifest.write({ path });

  // Finish up.
  return { bundle: dir, manifest };
}

/**
 * Create a bundle manifest for the given path.
 */
const bundleManifest = {
  async create(args: { path: string }) {
    const filename = fs.basename(args.path);
    const dir = fs.dirname(args.path);
    const names = (await fs.readdir(dir)).filter(name => name !== filename);
    const size = await fs.size.dir(dir);

    const isFile = (name: string) => fs.is.file(fs.join(dir, name));
    const files = (await Promise.all(
      names.map(async name => ({ name, isFile: await isFile(name) })),
    ))
      .filter(item => item.isFile)
      .map(item => item.name);
    const dirs = names.filter(name => !files.includes(name));

    const manifest: t.IBundleManifest = {
      createdAt: time.now.timestamp,
      bytes: size.bytes,
      size: size.toString(),
      files,
      dirs,
    };
    return manifest;
  },

  /**
   * Create and write a bundle manifest to disk.
   */
  async write(args: { path: string }) {
    const manifest = await bundleManifest.create(args);
    const yaml = jsYaml.safeDump(manifest);
    await fs.writeFile(args.path, yaml);
    return manifest;
  },
};
