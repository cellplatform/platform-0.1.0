import { fs } from '../common';

/**
 * Combine all LICENCE.txt files into a single file
 */
export async function mergeLicences(args: { dir: string }) {
  const dir = fs.resolve(args.dir);
  const pattern = `${dir}/*.LICENSE.txt`;
  const paths = await fs.glob.find(pattern);
  if (paths.length === 0) return;

  // Preapre merged file output.
  let output = '';

  const indent = (total: number, text: string) => {
    const lines = text.split('\n').map((line) => `${' '.repeat(total)}${line}`);
    return lines.join('\n');
  };

  for (const path of paths) {
    const filename = fs.basename(path);

    output += `file: ${filename}\n\n`;
    output += ` • The minified file includes references that have the following licencing details attached.\n`;
    output += ` • The extracted licencing details do not automatically pertain to the entire code file.\n`;
    output += `\n`;

    const content = (await fs.readFile(path)).toString();
    output += `${indent(6, content)}`;
    output += `\n\n\n\n`;
  }

  // Save single file and clean up.
  await fs.writeFile(fs.join(dir, 'LICENSE.txt'), output);
  for (const path of paths) {
    await fs.remove(path);
  }
}
