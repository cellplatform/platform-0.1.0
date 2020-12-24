import { exec } from '@platform/exec';
import { fs } from '@platform/fs';
// import { CompilerOptions } from 'typescript';

import { Typescript } from '../src/node/ts';

// console.log('ts', ts);

// const res = ts.transpileModule('tmp/src/index.ts', {});
// console.log('res', res);

(async () => {
  const compiler = Typescript.compiler();

  const res = await compiler.declarations('tmp/types.d.ts');
  console.log(res.outfile);
})();
