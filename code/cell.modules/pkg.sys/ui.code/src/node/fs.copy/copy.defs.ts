import { TypeManifest } from '@platform/cell.compiler';

import { fs, log, PATH, t } from '../common';

type FilterLine = (line: string) => boolean;

/**
 * Save the core ECMAScript and CellOS definition files
 * for insertion into the code editor.
 */
export async function copyDefs() {
  log.info.gray(`Type definitions\n`);

  await copyEcmaScript();
  await copySysTypes();
}

/**
 * Copies the base ES6 (ECMAScript) langauge declarations.
 */
async function copyEcmaScript() {
  const filenames = [
    'lib.es5.d.ts',
    'lib.es2015.core.d.ts',
    'lib.es2015.collection.d.ts',
    'lib.es2015.generator.d.ts',
    'lib.es2015.promise.d.ts',
    'lib.es2015.iterable.d.ts',
    'lib.es2015.proxy.d.ts',
    'lib.es2015.reflect.d.ts',
    'lib.es2015.symbol.d.ts',
  ];
  const sourceDir = fs.join(PATH.NODE_MODULES, 'typescript/lib');
  const targetDir = fs.resolve(PATH.STATIC.TYPES.ES);

  await copy({
    filenames,
    sourceDir,
    targetDir,
    filterLine: (line) => {
      /**
       * NOTE:
       *    The Javascript 'eval` function is considered unsafe.
       *    Never allow cell-code to execute arbitrary strings of code.
       *
       */
      if (line.startsWith('declare function eval')) {
        return false;
      }
      if (line.startsWith('declare var EvalError')) {
        return false;
      }
      return true;
    },
  });
}

/**
 * Copy the [sys.types] declarations.
 */
async function copySysTypes() {
  /**
   * TODO 🐷
   * NOTE: These are no longer the set of libs to copy.
   * Should be just the selection of libs for the environment.
   * See:
   *
   *    cell.types/types.Runtime/types.inner.env
   *
   *
   */

  const sourceDir = fs.join(PATH.NODE_MODULES, '@platform/cell.types/lib/types');
  const targetDir = fs.resolve(PATH.STATIC.TYPES.SYS);
  const filenames = (await fs.readdir(sourceDir)).filter((name) => name.endsWith('.d.ts'));

  await copy({
    filenames,
    sourceDir,
    targetDir,
    format: (text) => {
      const lines = text.split('\n').map((line) => {
        // NB: All the import refs are to be ignored as the Monaco editor
        //     is loading all of the declarations directly.
        if (line === `import { t } from '../common';`) return '';
        line = line.replace(/t\./g, '');
        line = line.includes('export') && line.includes('from') ? '' : line;
        return line;
      });

      return lines.filter((line) => Boolean(line.trim())).join('\n');
    },
  });
}

/**
 * Copies a set of [.d.ts] files declarations.
 */
async function copy(args: {
  filenames: string[];
  sourceDir: string;
  targetDir: string;
  format?: (input: string) => string;
  filterLine?: FilterLine;
}) {
  const { sourceDir, targetDir, filenames, filterLine } = args;

  await fs.remove(targetDir);
  await fs.ensureDir(targetDir);

  await Promise.all(
    filenames.map(async (item) => {
      const filename = {
        ts: item,
        txt: item.replace(/\.d\.ts$/, '.d.txt'), // NB: ".ts" files are served with wrong mime-type.  Change to plain text file ("text/plain")
      };
      const sourceFile = fs.join(sourceDir, filename.ts);
      const data = await fs.readFile(sourceFile);

      let text = data.toString();
      if (filterLine) {
        const lines = text.split('\n').filter((line) => filterLine(line));
        text = lines.join('\n');
      }

      text = args.format ? args.format(text) : text;

      // Copy file.
      if (text.length > 0) {
        const path = fs.join(targetDir, filename.txt);
        await fs.writeFile(path, text);
        log.info.gray(` • ${trimBase(targetDir)}/${log.green(filename.ts)} (.txt)`);
      }
    }),
  );

  // Save manifest file.
  await TypeManifest.createAndSave({
    base: fs.dirname(targetDir),
    dir: fs.basename(targetDir),
  });

  // Finish up.
  log.info();
}

const trimBase = (path: string) => path.substring(fs.resolve('.').length + 1);
