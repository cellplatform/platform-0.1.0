import { fs } from '@platform/fs';

/**
 * Save the core ECMAScript definition files to insertion
 * into the code editor.
 */
(async () => {
  const filenames = [
    'lib.es5.d.ts',
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
  const targetDir = fs.resolve('lib.d.ts');

  await fs.ensureDir(targetDir);

  const libs: { [name: string]: string } = {};
  await Promise.all(
    filenames.map(async filename => {
      const sourceFile = fs.join(sourceDir, filename);
      const file = await fs.readFile(sourceFile);
      libs[filename] = file.toString('utf8');

      //
      await fs.copy(sourceFile, fs.join(targetDir, filename));
    }),
  );

  const file = fs.resolve('src/components/Monaco.config/libs.d.yml');
  await fs.file.stringifyAndSave(file, { libs });
})();
