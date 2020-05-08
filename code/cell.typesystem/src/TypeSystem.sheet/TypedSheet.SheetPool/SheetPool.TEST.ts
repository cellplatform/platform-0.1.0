import { SheetPool } from '.';
import { TypeSystem } from '../..';
import { expect, t, testInstanceFetch, TYPE_DEFS, Subject } from '../../test';
import * as a from '../../test/.d.ts/all';

describe.only('SheetPool', () => {
  describe('lifecycle', () => {
    it('create', () => {
      const pool = SheetPool.create();
      expect(pool).to.be.an.instanceof(SheetPool);
    });

    it('dispose', async () => {
      const { sheet } = await testMySheet();
      const pool = SheetPool.create();
      let fired = 0;
      pool.dispose$.subscribe(() => fired++);

      pool.add(sheet);
      expect(pool.count).to.eql(1);

      expect(pool.isDisposed).to.eql(false);

      pool.dispose();
      pool.dispose();
      pool.dispose();

      expect(fired).to.eql(1);
      expect(pool.isDisposed).to.eql(true);
      expect(pool.count).to.eql(0);
      expect(pool.sheets).to.eql({});
    });
  });

  describe('caching', () => {
    it('add', async () => {
      const { sheet } = await testMySheet();
      const pool = SheetPool.create();

      expect(pool.count).to.eql(0);
      expect(pool.sheets[sheet.toString()]).to.eql(undefined);

      pool.add(sheet).add(sheet); // NB: chained.

      expect(pool.count).to.eql(1);
      expect(pool.exists(sheet)).to.eql(true);
      expect(pool.exists(sheet.uri)).to.eql(true);
      expect(pool.exists(sheet.uri.toString())).to.eql(true);

      expect(pool.sheets[sheet.toString()]).to.eql(sheet);
    });

    it('remove', async () => {
      const { sheet } = await testMySheet();
      const pool = SheetPool.create();

      pool.add(sheet);
      expect(pool.exists(sheet)).to.eql(true);

      pool.remove(sheet).remove(sheet); // NB: chained.

      expect(pool.count).to.eql(0);
      expect(pool.exists(sheet)).to.eql(false);
      expect(pool.exists(sheet.uri)).to.eql(false);
      expect(pool.exists(sheet.uri.toString())).to.eql(false);
    });

    it('children', async () => {
      const { sheet } = await testMySheet();
      const pool = SheetPool.create();
      const cursor = await sheet.data<a.MyRow>('MyRow').load();
      const child = (await cursor.row(0).props.messages.load()).sheet;

      expect(pool.children(sheet)).to.eql([]);

      pool
        .add(sheet)
        .add(child, { parent: sheet })
        .add(child, { parent: sheet }); // NB: repeated add, does not duplicate.

      const children = pool.children(sheet);
      expect(children.length).to.eql(1);
      expect(children[0]).to.equal(child);
    });

    describe('auto-removal', () => {
      it('removes child sheet when parent sheet removed', async () => {
        const { sheet } = await testMySheet();
        const pool = SheetPool.create();
        const cursor = await sheet.data<a.MyRow>('MyRow').load();
        const child = (await cursor.row(0).props.messages.load()).sheet;

        pool.add(sheet).add(child, { parent: sheet });

        expect(pool.count).to.eql(2);
        expect(pool.exists(sheet)).to.eql(true);
        expect(pool.exists(child)).to.eql(true);

        pool.remove(sheet);
        expect(pool.count).to.eql(0);
      });

      it('removes child sheet when parent sheet disposed', async () => {
        const { sheet } = await testMySheet();
        const pool = SheetPool.create();
        const cursor = await sheet.data<a.MyRow>('MyRow').load();
        const child = (await cursor.row(0).props.messages.load()).sheet;

        pool.add(sheet).add(child, { parent: sheet });
        expect(pool.count).to.eql(2);

        sheet.dispose();
        expect(pool.count).to.eql(0);
      });

      it('does not remove parent when child removed', async () => {
        const { sheet } = await testMySheet();
        const pool = SheetPool.create();
        const cursor = await sheet.data<a.MyRow>('MyRow').load();
        const child = (await cursor.row(0).props.messages.load()).sheet;

        pool.add(sheet).add(child, { parent: sheet });
        expect(pool.count).to.eql(2);

        child.dispose();
        expect(pool.count).to.eql(1);
        expect(pool.exists(sheet)).to.eql(true);
        expect(pool.exists(child)).to.eql(false);
      });
    });
  });
});

/**
 * HELPERS: Test Data
 */

const testFetchMySheet = (ns: string, cells?: t.ICellMap) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo',
    defs: TYPE_DEFS,
    cells,
  });
};

const testMySheet = async (cells?: t.ICellMap) => {
  const ns = 'ns:foo.mySheet';
  const event$ = new Subject<t.TypedSheetEvent>();
  const fetch = await testFetchMySheet(ns, cells);
  const sheet = await TypeSystem.Sheet.load<m.MyRow>({ fetch, ns, event$ });
  return { ns, fetch, sheet, event$ };
};
