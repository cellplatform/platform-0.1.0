import { SheetPool } from '.';
import { TypeSystem } from '../..';
import { expect, Subject, t, testInstanceFetch, TYPE_DEFS } from '../../test';
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

  describe('add/remove/sheet/children (caching)', () => {
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

    it('sheet', async () => {
      const { sheet } = await testMySheet();
      const pool = SheetPool.create();

      expect(pool.sheet(sheet)).to.eql(undefined);
      expect(pool.sheet(sheet.uri)).to.eql(undefined);
      expect(pool.sheet(sheet.toString())).to.eql(undefined);

      pool.add(sheet);

      expect(pool.sheet(sheet)).to.eql(sheet);
      expect(pool.sheet(sheet.uri)).to.eql(sheet);
      expect(pool.sheet(sheet.toString())).to.eql(sheet);
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

  describe('auto pooling with sheet/refs', () => {
    describe('generates new pool instances', () => {
      it('sheet.load()', async () => {
        const ns = 'ns:foo.mySheet';
        const fetch = await testFetchMySheet(ns);
        const sheet = await TypeSystem.Sheet.load<a.MyRow>({ fetch, ns });
        expect(sheet.pool).to.be.an.instanceof(SheetPool);
      });

      it('sheet.create()', async () => {
        const fetch = await testFetchMySheet('ns:foo.mySheet');
        const sheet = await TypeSystem.Sheet.create<a.MyRow>({ fetch, implements: 'ns:foo' });
        expect(sheet.pool).to.be.an.instanceof(SheetPool);
      });
    });

    describe('uses given pool', () => {
      it('sheet.load()', async () => {
        const ns = 'ns:foo.mySheet';
        const fetch = await testFetchMySheet(ns);
        const pool = SheetPool.create();
        const sheet1 = await TypeSystem.Sheet.load<a.MyRow>({ fetch, ns, pool });
        expect(sheet1.pool).to.equal(pool);

        const sheet2 = await TypeSystem.Sheet.load<a.MyRow>({ fetch, ns, pool });
        expect(sheet1).to.equal(sheet2);
      });

      it('sheet.create()', async () => {
        const fetch = await testFetchMySheet('ns:foo.mySheet');
        const pool = SheetPool.create();
        const args = { fetch, implements: 'ns:foo', ns: 'ns:foo.mySheet', pool };
        const sheet1 = await TypeSystem.Sheet.create<a.MyRow>(args);
        expect(sheet1.pool).to.equal(pool);

        const sheet2 = await TypeSystem.Sheet.create<a.MyRow>(args);
        expect(sheet1).to.equal(sheet2);
      });
    });

    it('inserts sheet into pool', async () => {
      const { sheet } = await testMySheet();
      expect(sheet.pool.exists(sheet)).to.eql(true);

      sheet.dispose();
      expect(sheet.pool.exists(sheet)).to.eql(false);
    });

    it('uses pool on child ref', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testFetchMySheet(ns);
      const pool = SheetPool.create();
      const sheet = await TypeSystem.Sheet.load<a.MyRow>({ fetch, ns, pool });
      expect(sheet.pool.exists(sheet)).to.eql(true);

      const cursor = await sheet.data<a.MyRow>('MyRow').load();
      const child = (await cursor.row(0).props.messages.load()).sheet;
      expect(sheet.pool).to.equal(child.pool);
      expect(sheet.pool.exists(child)).to.eql(true);
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
  const sheet = await TypeSystem.Sheet.load<a.MyRow>({ fetch, ns, event$ });
  return { ns, fetch, sheet, event$ };
};
