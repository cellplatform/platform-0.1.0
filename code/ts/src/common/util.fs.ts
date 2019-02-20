import { fs } from './libs';

/**
 * Changes all file-extensions in the given directory.
 */
export async function changeExtensions(args: { dir: string; from: string; to: string }) {
  const { dir } = args;
  const formatExtension = (ext: string) => `.${ext.replace(/^\./, '')}`;
  const from = formatExtension(args.from);
  const to = formatExtension(args.to);

  const rename = async (before: string) => {
    const after = `${before.substr(0, before.length - from.length)}${to}`;
    await fs.rename(before, after);
  };

  for (const name of await fs.readdir(args.dir)) {
    const path = fs.join(dir, name);
    const info = await fs.lstat(path);
    const isFile = info.isFile();
    if (isFile && name.endsWith(from)) {
      await rename(path);
    }
    if (!isFile && info.isDirectory()) {
      await changeExtensions({ dir: fs.join(dir, name), from, to }); // <== RECURSION
    }
  }
}
