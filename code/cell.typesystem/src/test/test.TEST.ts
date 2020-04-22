import { fs, testFetch, TYPE_DEFS } from '.';
import { TypeClient } from '../TypeSystem/TypeClient';
import { expect } from 'chai';

describe.only('test', () => {
  describe('TypeSystem: generate sample typescript declaration files', () => {
    const dir = fs.join(__dirname, '../test/.d.ts');

    const save = async (ns: string) => {
      ns = ns.trim().replace(/^ns\:/, '');

      const fetch = testFetch({ defs: TYPE_DEFS });
      const defs = (await TypeClient.load({ ns, fetch })).defs;

      const ts = TypeClient.typescript(defs[0]);
      await ts.save(fs, dir, { filename: ns });
    };

    it('save: test/foo.d.ts', async () => save('foo'));
    it('save: test/foo.primitives.d.ts', async () => save('foo.primitives'));
    it('save: test/foo.messages.d.ts', async () => save('foo.messages'));
    it('save: test/foo.enum.d.ts', async () => save('foo.enum'));
    it('save: test/foo.defaults.d.ts', async () => save('foo.defaults'));
  });

  describe('fetch', () => {
    const fetch = testFetch({
      defs: TYPE_DEFS,
      cells: {
        A1: { value: 'A1' },
        A2: { value: 'A2' },
        B1: { value: 'B1' },
        B5: { value: 'B5' },
        C1: { value: 'C1' },
        Z9: { value: 'Z9' },
      },
    });

    it('getCells', async () => {
      const res = await fetch.getCells({ ns: 'foo', query: 'A1:ZZ99' });
      const cells = res.cells || {};
      expect(res.total.rows).to.eql(9);
      expect(Object.keys(cells).sort()).to.eql(['A1', 'A2', 'B1', 'B5', 'C1', 'Z9']);
    });

    it('getCells: query', async () => {
      const res = await fetch.getCells({ ns: 'foo', query: 'A1:B4' });
      const cells = res.cells || {};
      expect(res.total.rows).to.eql(9);
      expect(Object.keys(cells).sort()).to.eql(['A1', 'A2', 'B1', 'B5', 'C1', 'Z9']);
    });
  });
});
