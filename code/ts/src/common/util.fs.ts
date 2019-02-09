import { fs, join } from './libs';

/**
 * Changes all file-extensions in the given directory.
 */
export function changeExtensions(args: {
  dir: string;
  from: string;
  to: string;
}) {
  const { dir } = args;
  const formatExtension = (ext: string) => `.${ext.replace(/^\./, '')}`;
  const from = formatExtension(args.from);
  const to = formatExtension(args.to);

  const rename = (before: string) => {
    const after = `${before.substr(0, before.length - from.length)}${to}`;
    fs.renameSync(before, after);
  };

  for (const name of fs.readdirSync(args.dir)) {
    const path = join(dir, name);
    const info = fs.lstatSync(path);
    const isFile = info.isFile();
    if (isFile && name.endsWith(from)) {
      rename(path);
    }
    if (!isFile && info.isDirectory()) {
      changeExtensions({ dir: join(dir, name), from, to }); // <== RECURSION
    }
  }
}
