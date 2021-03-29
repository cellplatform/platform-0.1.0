import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

type FilterLine = (line: string) => boolean;

/**
 * Copies a set of [.d.ts] files declarations.
 */
async function copy(args: {
  filenames: string[];
  sourceDir: string;
  targetDir?: string;
  targetYaml?: string;
  format?: (input: string) => string;
  filterLine?: FilterLine;
}) {
  const { sourceDir, targetDir, targetYaml, filenames } = args;

  if (targetDir) {
    await fs.ensureDir(targetDir);
  }

  const libs: { [name: string]: string } = {};
  await Promise.all(
    filenames.map(async (filename) => {
      const sourceFile = fs.join(sourceDir, filename);
      const file = await fs.readFile(sourceFile);

      let text = file.toString();
      if (args.filterLine) {
        const lines = text.split('\n').filter((line) => args.filterLine(line));
        text = lines.join('\n');
      }

      text = args.format ? args.format(text) : text;

      libs[filename] = text;

      if (targetDir) {
        const path = fs.join(targetDir, filename);
        await fs.writeFile(path, text);
      }

      log.info.gray('filename:', log.green(filename));
    }),
  );

  if (targetYaml) {
    const file = targetYaml;
    await fs.file.stringifyAndSave(file, { libs });
  }

  log.info();
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
  const sourceDir = fs.resolve('node_modules/typescript/lib');
  const targetDir = fs.resolve('lib.es.d.ts');
  const targetYaml = fs.resolve('src/components/Monaco.config/libs-es.d.yml');
  await copy({
    filenames,
    sourceDir,
    targetDir,
    targetYaml,
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
async function copyCellTypes() {
  const sourceDir = fs.resolve('node_modules/@platform/cell.types/lib/types');
  const targetDir = fs.resolve('lib.cell.d.ts');
  const targetYaml = fs.resolve('src/components/Monaco.config/libs-cell.d.yml');

  const filenames = (await fs.readdir(sourceDir)).filter((name) => name.endsWith('.d.ts'));
  await copy({
    filenames,
    sourceDir,
    targetDir,
    targetYaml,
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

/**
 * Save the core ECMAScript and CellOS definition files
 * for insertion into the code editor.
 */
(async () => {
  await copyEcmaScript();
  await copyCellTypes();
})();
