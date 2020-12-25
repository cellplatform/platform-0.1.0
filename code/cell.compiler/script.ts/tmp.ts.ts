import { Typescript } from '../src/node/ts';

(async () => {
  const compiler = Typescript.compiler();
  const res = await compiler.declarations('tmp/types.d.ts');

  console.log(res.outfile);
})();
