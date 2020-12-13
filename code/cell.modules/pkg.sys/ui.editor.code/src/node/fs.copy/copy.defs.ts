import { fs, log, NODE_MODULES, t, hash } from '../common';

type FilterLine = (line: string) => boolean;

/**
 * Save the core ECMAScript and CellOS definition files
 * for insertion into the code editor.
 */
export function copyDefs() {
  log.info.gray(`Type definitions\n`);

  copyEcmaScript();
  copyCellTypes();
}

/**
 * Copies a set of [.d.ts] files declarations.
 */
function copy(args: {
  filenames: string[];
  sourceDir: string;
  targetDir: string;
  format?: (input: string) => string;
  filterLine?: FilterLine;
}) {
  const { sourceDir, targetDir, filenames, filterLine } = args;
  const manifest: t.TypeFileManifest = { hash: '', files: [] };

  fs.removeSync(targetDir);
  fs.ensureDirSync(targetDir);

  filenames.map((item) => {
    const filename = {
      ts: item,
      txt: item.replace(/\.ts$/, '.txt'), // NB: ".ts" files are served with wrong mime-type.  Change to plain text file ("text/plain")
    };
    const sourceFile = fs.join(sourceDir, filename.ts);
    const data = fs.readFileSync(sourceFile);

    let text = data.toString();
    if (filterLine) {
      const lines = text.split('\n').filter((line) => filterLine(line));
      text = lines.join('\n');
    }

    text = args.format ? args.format(text) : text;

    if (text.length > 0) {
      // Copy file.
      const path = fs.join(targetDir, filename.txt);
      fs.writeFileSync(path, text);
      log.info.gray(` • ${trimBase(targetDir)}/${log.green(filename.ts)} (.txt)`);

      // Add the file to the manifest.
      manifest.files.push({
        filename: filename.txt,
        filehash: hash.sha256(data),
        bytes: fs.readFileSync(path).byteLength,
      });
    }
  });

  // Save manifest file.
  manifest.hash = hash.sha256(manifest.files.map((file) => file.filehash));
  const path = fs.join(targetDir, 'index.json');
  const json = JSON.stringify(manifest, null, '  ');
  fs.writeFileSync(path, `${json}\n`);

  // Finish up.
  log.info();
}

/**
 * Copies the base ES6 (ECMAScript) langauge declarations.
 */
function copyEcmaScript() {
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
  const sourceDir = fs.join(NODE_MODULES, 'typescript/lib');
  const targetDir = fs.resolve('static/types/lib.es.d.ts');

  copy({
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
 * Copy the [cell.types] declarations.
 */
function copyCellTypes() {
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

  const sourceDir = fs.join(NODE_MODULES, '@platform/cell.types/lib/types');
  const targetDir = fs.resolve('static/types/lib.cell.d.ts');
  const filenames = fs.readdirSync(sourceDir).filter((name) => name.endsWith('.d.ts'));

  copy({
    filenames,
    sourceDir,
    targetDir,
    format: (text) => {
      const lines = text.split('\n').map((line) => {
        // NB: All the import refs are to be ignored as the Monaco editor
        //     is loading all of the declarations directly.
        if (line === `import { t } from '../common';`) {
          return '';
        }
        line = line.replace(/t\./g, '');
        line = line.includes('export') && line.includes('from') ? '' : line;
        return line;
      });

      return lines.filter((line) => Boolean(line.trim())).join('\n');
    },
  });
}

const trimBase = (path: string) => path.substring(fs.resolve('.').length + 1);
