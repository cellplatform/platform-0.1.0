import { expect } from '../../test';
import { CompileSamples, Compiler } from '../CompileSamples';

const samples = {
  pkg1: CompileSamples.make(
    '/node.pkg-1',
    Compiler.config('pkg-1')
      .namespace('sample')
      .entry('./src/tests/test.cell.runtime.node/sample.dedupe/pkg-1/main')
      .target('node'),
  ),
};

describe.skip('cell.runtime.node: Compiler', () => {
  it('TMP', async () => {
    //
  });
});
