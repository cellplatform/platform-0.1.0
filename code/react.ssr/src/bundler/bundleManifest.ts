import { fs, time, jsYaml, constants, t } from '../common';

/**
 * Create a bundle manifest for the given path.
 */

export async function create(args: { path: string }) {
  const filename = fs.basename(args.path);
  const dir = fs.dirname(args.path);
  const names = (await fs.readdir(dir)).filter(name => name !== filename);
  const size = await fs.size.dir(dir);

  const isFile = (name: string) => fs.is.file(fs.join(dir, name));
  const files = (await Promise.all(names.map(async name => ({ name, isFile: await isFile(name) }))))
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
}

/**
 * Create and write a bundle manifest to disk.
 */
export async function write(args: { path: string }) {
  const manifest = await create(args);
  const yaml = jsYaml.safeDump(manifest);
  await fs.writeFile(args.path, yaml);
  return manifest;
}
