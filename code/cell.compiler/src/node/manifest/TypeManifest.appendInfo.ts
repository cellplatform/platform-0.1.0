import { fs, t } from '../common';

/**
 * Appends type information to a file-manifest entry.
 */
export async function appendFileInfo(dir: string, input: t.ManifestFile) {
  const path = fs.join(dir, input.path);
  const text = (await fs.readFile(path)).toString();
  const lines = text.split('\n');

  const notRelative = (module: string) => !module.startsWith('.');
  const include = (module: string) => Boolean(module) && notRelative(module);

  const declaration: t.TypeManifestFileInfo = {
    imports: lines.map((line) => toImport(line)).filter(include),
    exports: lines.map((line) => toExport(line)).filter(include),
  };

  return { ...input, declaration } as t.TypeManifestFile;
}

function toImport(line: string) {
  const match = line.match(/^\s*import .* from '.*';$/g);
  return match ? toModuleRef(line) : '';
}

function toExport(line: string) {
  const match = line.match(/^\s*export .* from '.*';$/g);
  return match ? toModuleRef(line) : '';
}

function toModuleRef(line: string) {
  const match = line.match(/from '.*';/g);
  return match ? match[0].replace(/^from '/, '').replace(/';/, '') : '';
}
