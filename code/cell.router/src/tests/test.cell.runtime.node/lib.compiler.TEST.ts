import { expect, TestCompile, Compiler } from '../../test';

const make = (name: string) => {
  return TestCompile.make(
    `node.dedupe/${name}`,
    Compiler.config(name)
      .namespace('sample')
      .target('node')
      .shared((e) => e.add('@platform/log'))
      .entry(`./src/tests/test.cell.runtime.node/sample.dedupe/${name}/entry`),
  );
};

const samples = {
  pkg1: make('pkg-1'),
  pkg2: make('pkg-2'),
};

describe('cell.runtime.node: Compiler', function () {
  this.timeout(99999);

  before(async () => {
    const force = false;
    await Promise.all([samples.pkg1.bundle(force), samples.pkg2.bundle(force)]);
  });

  it.skip('deduped (filehash on similar code)', async () => {
    //
  });
});
