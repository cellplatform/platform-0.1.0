import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TypedSheet } from '.';
import { TypeSystem } from '..';
import { ERROR, expect, expectError, t, testInstanceFetch, time, TYPE_DEFS } from '../../test';
import * as f from '../../test/.d.ts/foo';
import * as e from '../../test/.d.ts/foo.enum';
import * as d from '../../test/.d.ts/foo.defaults';
import * as p from '../../test/.d.ts/foo.primitives';
import { TypeClient } from '../TypeClient';
import { TypedSheetData } from './TypedSheetData';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';
import { TypedSheetRow } from './TypedSheetRow';
import { TypedSheetState } from './TypedSheetState';

/**
 * TODO 🐷 Features
 * - error check typename on NS upon writing (Captialised, no spaces)
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - change handler (pending => save)
 * - read/write: linked sheet
 * - remove `ready()` (single concept `load()` ??)
 */

describe('TypedSheet', () => {
  describe('lifecycle', () => {
    it('dispose', async () => {
      const { sheet } = await testSheet();

      let fired = 0;
      sheet.dispose$.subscribe(e => fired++);

      expect(sheet.isDisposed).to.eql(false);
      expect(sheet.state.isDisposed).to.eql(false);

      sheet.dispose();
      sheet.dispose();
      sheet.dispose();

      expect(sheet.isDisposed).to.eql(true);
      expect(sheet.state.isDisposed).to.eql(true);

      expect(fired).to.eql(1);
    });
  });

  describe('errors', () => {
    it('error: 404 instance namespace "type.implements" reference not found', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testInstanceFetch({
        instance: ns,
        implements: 'ns:foo.notExist',
        defs: TYPE_DEFS,
        rows: [],
      });
      const sheet = await TypeSystem.Sheet.load({ fetch, ns });

      expect(sheet.ok).to.eql(false);
      expect(sheet.errors[0].message).to.include(`The namespace "ns:foo.notExist" does not exist`);
      expect(sheet.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
    });
  });

  describe('TypedSheetData (cursor)', () => {
    it('create: default (unloaded)', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();
      expect(cursor.range).to.eql(TypedSheetData.DEFAULT.RANGE);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);
    });

    it('create: custom range (auto correct)', async () => {
      const { sheet } = await testSheet();
      const DEFAULT = TypedSheetData.DEFAULT;

      const test = (range: string, expected?: string) => {
        const res = sheet.data(range);
        expect(res.range).to.eql(expected || range);
      };

      test('3:15');
      test('10:50');
      test('1:80');
      test('', DEFAULT.RANGE);
      test('  ', DEFAULT.RANGE);

      test('0:0', '1:1');
      test('0:10', '1:10');
      test('10:0', '1:10');
      test('500:500');

      test('.:.', DEFAULT.RANGE);
      test('-1:10', DEFAULT.RANGE);
      test('1:-10', DEFAULT.RANGE);

      test('A:5', '1:5');
      test('C:5', '1:5');
      test('5:C', '1:5');

      test('*:*', DEFAULT.RANGE);
      test('**:**', DEFAULT.RANGE);
      test('*:**', DEFAULT.RANGE);
      test('**:*', DEFAULT.RANGE);

      test('1:*', DEFAULT.RANGE);
      test('1:**', DEFAULT.RANGE);
      test('*:1', DEFAULT.RANGE);
      test('**:1', DEFAULT.RANGE);

      test('0:*', `1:${DEFAULT.PAGE}`);
      test('10:*', `10:${DEFAULT.PAGE}`);
      test('*:800', `${DEFAULT.PAGE}:800`);
      test('800:*', `${DEFAULT.PAGE}:800`);
    });

    it('load (status: INIT ➔ LOADING ➔ LOADED)', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();

      expect(cursor.isReady).to.eql(false);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);

      expect(cursor.row(0).isReady).to.eql(false);

      const wait = cursor.load();

      expect(cursor.status).to.eql('LOADING');
      expect(cursor.total).to.eql(-1);

      await wait;

      expect(cursor.status).to.eql('LOADED');
      expect(cursor.isReady).to.eql(true);
      expect(cursor.total).to.eql(9);

      expect(cursor.row(0).isReady).to.eql(true);
      expect(cursor.row(8).isReady).to.eql(true);
      expect(cursor.row(9).isReady).to.eql(false);
    });

    it('load (subset)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.data('2:5').load();
      expect(cursor.row(0).isReady).to.eql(false);
      expect(cursor.row(1).isReady).to.eql(true);
      expect(cursor.row(4).isReady).to.eql(true);
      expect(cursor.row(5).isReady).to.eql(false);
    });

    it('load (expand range from [loaded] state)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.data('1:5').load();

      expect(cursor.isReady).to.eql(true);
      expect(cursor.range).to.eql('1:5');

      expect(cursor.row(0).isReady).to.eql(true);
      expect(cursor.row(8).isReady).to.eql(false);

      await cursor.load('3:15');

      expect(cursor.range).to.eql('1:15'); //           NB: includes the initial load (starting at 1 not 3).
      expect(cursor.row(8).isReady).to.eql(true); //   NB: Now loaded.
      expect(cursor.row(14).isReady).to.eql(false); // NB: does not exist yet.
    });

    it('load (reset range from [unloaded] state)', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();

      expect(cursor.isReady).to.eql(false);
      expect(cursor.range).to.eql(TypedSheetData.DEFAULT.RANGE);

      await cursor.load('3:15');
      expect(cursor.isReady).to.eql(true);
      expect(cursor.range).to.eql('3:15'); // NB: starts at the initial loaded range.

      expect(cursor.row(0).isReady).to.eql(false);
      expect(cursor.row(1).isReady).to.eql(false);
      expect(cursor.row(2).isReady).to.eql(true);
      expect(cursor.row(8).isReady).to.eql(true);
      expect(cursor.row(14).isReady).to.eql(false); // NB: does not exist yet.
    });

    it('events: loading | loaded', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();

      const fired: t.TypedSheetEvent[] = [];
      sheet.events$
        .pipe(filter(e => e.type === 'SHEET/loading' || e.type === 'SHEET/loaded'))
        .subscribe(e => fired.push(e));

      await cursor.load();

      expect(fired.length).to.eql(2);

      const e1 = fired[0] as t.ITypedSheetLoadingEvent;
      const e2 = fired[1] as t.ITypedSheetLoadedEvent;

      expect(e1.type).to.eql('SHEET/loading');
      expect(e1.payload.ns).to.eql(cursor.uri.toString());
      expect(e1.payload.range).to.eql(cursor.range);

      expect(e2.type).to.eql('SHEET/loaded');
      expect(e2.payload.ns).to.eql(cursor.uri.toString());
      expect(e2.payload.range).to.eql(cursor.range);
      expect(e2.payload.total).to.eql(9);
    });

    it('does not load twice if already LOADING', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();
      const fired: t.TypedSheetEvent[] = [];
      sheet.events$
        .pipe(filter(e => e.type === 'SHEET/loading' || e.type === 'SHEET/loaded'))
        .subscribe(e => fired.push(e));

      await Promise.all([cursor.load(), cursor.load(), cursor.load()]);
      expect(fired.length).to.eql(2); // NB: Would be 6 if load de-duping wan't implemented.
    });

    it('does load twice if query differs', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.data();
      const fired: t.TypedSheetEvent[] = [];
      sheet.events$
        .pipe(filter(e => e.type === 'SHEET/loading' || e.type === 'SHEET/loaded'))
        .subscribe(e => fired.push(e));

      await Promise.all([
        cursor.load(),
        cursor.load(),
        cursor.load('4:6'),
        cursor.load(),
        cursor.load('4:6'),
        cursor.load(),
      ]);

      expect(fired.length).to.eql(4); // NB: Only two load operations out of 6 invoked.
    });
  });

  describe('TypedSheetData', () => {
    it('throw: row out-of-bounds (index: -1)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.data().load();
      const err = /Row index must be >=0/;
      expect(() => cursor.row(-1)).to.throw(err);
    });

    it('exists', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.data().load();

      expect(cursor.exists(-1)).to.eql(false);
      expect(cursor.exists(0)).to.eql(true);
      expect(cursor.exists(99)).to.eql(false);
    });

    it('retrieves non-existent row', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.data().load();
      expect(cursor.exists(99)).to.eql(false);
      expect(cursor.row(99)).to.not.eql(undefined);
    });

    it('toObject', async () => {
      const { sheet } = await testSheetEnum();
      const row = (await sheet.data().load()).row(0);
      expect(row.toObject()).to.eql({
        single: 'hello',
        union: ['blue'],
        array: ['red', 'green', 'blue'],
      });
    });
  });

  describe('TypedSheetRow', () => {
    const testRow = async (uri: string) => {
      const ctx = TypedSheet.ctx({ fetch: await testFetchMySheet('ns:foo.mySheet') });
      const ns = await TypeClient.load({ ns: 'ns:foo', fetch: ctx.fetch, cache: ctx.cache });
      const columns = ns[0].columns;
      const row = TypedSheetRow.create<f.MyRow>({ uri, columns, ctx });
      return { row, ctx, ns };
    };

    it('throw: URI not a row', async () => {
      expectError(async () => testRow('cell:foo:A1'));
      expectError(async () => testRow('ns:foo'));
      expectError(async () => testRow('file:foo:abc'));
    });

    it('create (not loaded)', async () => {
      const { row, ns } = await testRow('cell:foo:1');
      expect(row.uri.toString()).to.eql('cell:foo:1');
      expect(row.index).to.eql(0);

      expect(row.status).to.eql('INIT');
      expect(row.isReady).to.eql(false);

      expect(row.types.list).to.eql(ns[0].columns);
      expect(row.types.map.title.column).to.eql('A');

      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);
    });

    it('load', async () => {
      const { row } = await testRow('cell:foo:1');

      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);
      expect(row.isReady).to.eql(false);
      expect(row.status).to.eql('INIT');

      const res = row.load();

      expect(row.isReady).to.eql(false);
      expect(row.status).to.eql('LOADING');

      await res;

      expect(row.isReady).to.eql(true);
      expect(row.status).to.eql('LOADED');

      expect(row.props.title).to.eql('One');
      expect(row.props.isEnabled).to.eql(true);
    });

    it('load (static)', async () => {
      const { ns, ctx } = await testRow('cell:foo:1');
      const uri = 'cell:foo:1';
      const columns = ns[0].columns;
      const row = await TypedSheetRow.load<f.MyRow>({ uri, columns, ctx });

      expect(row.props.title).to.eql('One');
      expect(row.props.isEnabled).to.eql(true);
    });

    it('load (subset of props)', async () => {
      const { row } = await testRow('cell:foo:1');
      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);

      await row.load({ props: ['title'] });

      expect(row.props.title).to.eql('One');
      expect(row.props.isEnabled).to.eql(undefined);
    });

    it('updates when prop changed elsewhere via event (ie. change not via row instance API)', async () => {
      const { row, ctx } = await testRow('cell:foo:1');
      expect(row.props.title).to.eql('Untitled');

      await row.load();
      expect(row.props.title).to.eql('One');

      // Make change to property externally to row.
      ctx.events$.next({
        type: 'SHEET/change',
        payload: {
          cell: 'cell:foo:A1',
          data: { value: 'Hello!' },
        },
      });
      expect(row.props.title).to.eql('Hello!'); // NB: Row state reflects external event change.

      row.props.title = 'Foobar';
      expect(row.props.title).to.eql('Foobar'); // NB: Update via prop (normal behavior).
    });

    describe('row events$', () => {
      it('fires load events', async () => {
        const { sheet } = await testSheet();
        const cursor = sheet.data();

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$
          .pipe(filter(e => e.type === 'SHEET/row/loading' || e.type === 'SHEET/row/loaded'))
          .subscribe(e => fired.push(e));

        await cursor.load();

        const loading = fired.filter(e => e.type === 'SHEET/row/loading');
        const loaded = fired.filter(e => e.type === 'SHEET/row/loaded');

        expect(loading.length).to.eql(9);
        expect(loaded.length).to.eql(9);
      });

      it('repeat loads', async () => {
        const { sheet } = await testSheet();
        const cursor = sheet.data();

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$
          .pipe(filter(e => e.type === 'SHEET/row/loading' || e.type === 'SHEET/row/loaded'))
          .subscribe(e => fired.push(e));

        await cursor.load();
        expect(fired.length).to.eql(18);

        await cursor.load();
        expect(fired.length).to.eql(18); // NB: already loaded.

        const row = cursor.row(0);
        await row.load();
        expect(fired.length).to.eql(18); // NB: already loaded.

        await row.load({ force: true });
        expect(fired.length).to.eql(18 + 2);
      });

      it('shared load promise', async () => {
        const { sheet } = await testSheet();
        const cursor = sheet.data();
        const row = cursor.row(0);

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$
          .pipe(filter(e => e.type === 'SHEET/row/loading' || e.type === 'SHEET/row/loaded'))
          .subscribe(e => fired.push(e));

        await Promise.all([
          row.load(),
          row.load({ props: ['title'] }),
          row.load(),
          row.load(),
          row.load(),
          row.load(),
          row.load({ props: ['title'] }),
        ]);

        expect(fired.length).to.eql(4);

        await row.load({ force: true });
        expect(fired.length).to.eql(6);

        await row.load({ force: false });
        expect(fired.length).to.eql(6);
      });

      it('await row.ready()', async () => {
        const { sheet } = await testSheet();
        const cursor = sheet.data();
        const row = cursor.row(0);

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$
          .pipe(filter(e => e.type === 'SHEET/row/loading' || e.type === 'SHEET/row/loaded'))
          .subscribe(e => fired.push(e));

        await Promise.all([
          row.ready(),
          row.ready(),
          row.ready(),
          row.ready(),
          row.ready(),
          row.ready(),
        ]);

        expect(fired.length).to.eql(2);
      });

      it('fires on row property set (only when changed)', async () => {
        const { sheet } = await testSheet();
        const cursor = sheet.data();
        const row = cursor.row(0);

        await row.ready();

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$.subscribe(e => fired.push(e));

        row.props.title = 'Foo';
        expect(fired.length).to.eql(1);
        expect(fired[0].type).to.eql('SHEET/change');

        row.props.title = 'Foo';
        expect(fired.length).to.eql(1); // NB: No change.
      });
    });

    describe('row types', () => {
      it('row.types.list', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.data().load();
        const types = cursor.row(0).types;

        const list1 = types.list;
        const list2 = types.list;

        expect(list1).to.equal(list2); // Lazily evalutated, common instance returned.
        expect(list1.map(def => def.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
      });

      it('row.types.map', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.data().load();
        const types = cursor.row(0).types;

        expect(types.map.title.column).to.eql('A');
        expect(types.map.isEnabled.column).to.eql('B');
        expect(types.map.color.column).to.eql('C');
        expect(types.map.message.column).to.eql('D');
        expect(types.map.messages.column).to.eql('E');
      });
    });

    describe('default value', () => {
      it('simple: primitive | {object}', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.data().load(); // NB:

        const row1 = cursor.row(0).props; //  NB: Exists.
        const row2 = cursor.row(99).props; // NB: Does not exist (use default).

        expect(row1.stringValue).to.eql('hello value');
        expect(row2.stringValue).to.eql('Hello (Default)');
      });

      it('ref (look up cell address)', async () => {
        const ns = 'ns:foo.sample';
        const fetch = await testInstanceFetch({
          instance: ns,
          implements: 'ns:foo.defaults',
          defs: TYPE_DEFS,
          rows: [],
          cells: { A1: { value: 'my-foo-default' } },
        });

        const sheet = await TypeSystem.Sheet.load({ fetch, ns });
        const cursor = await sheet.data<d.MyDefaults>().load();
        expect(cursor.exists(99)).to.eql(false);
      });
    });

    describe('row.prop (get/set methods)', () => {
      type P = TypedSheetRow<p.Primitives>;
      type R = TypedSheetRow<f.MyRow>;

      it('reuse api instance', async () => {
        const { sheet } = await testSheetPrimitives();
        const row = (await sheet.data().load()).row(0) as P;

        const prop1 = row.prop('numberProp');
        const prop2 = row.prop('numberProp');
        const prop3 = row.prop('stringValue');

        expect(prop1).to.equal(prop2);
        expect(prop1).to.not.equal(prop3);
      });

      it('get', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.data().load();

        const prop1 = (cursor.row(0) as P).prop('stringValue');
        const prop2 = (cursor.row(99) as P).prop('stringValue');

        expect(prop1.get()).to.eql('hello value');
        expect(prop2.get()).to.eql('Hello (Default)');
      });

      it('set', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.data().load();
        const prop = (cursor.row(0) as P).prop('stringValue');

        prop.set('');
        expect(prop.get()).to.eql(''); // NB: Immediate

        expect(await sheet.state.getCell('A1')).to.eql({ value: 'hello value' }); // NB: Fetch-cache still has the old value.
        await time.wait(1);
        expect(await sheet.state.getCell('A1')).to.eql({ value: '' }); // NB: and not the fetch-cache is updated.

        prop.set(' ');
        expect(prop.get()).to.eql(' ');

        prop.set('foo');
        expect(prop.get()).to.eql('foo');
      });

      it('set: throw if attempt to set ref', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.data().load();
        const row = cursor.row(0) as R;
        expect(() => row.prop('messages').set({} as any)).to.throw(/Cannot write to property/);
        expect(() => row.prop('message').set({} as any)).to.throw(/Cannot write to property/);

        // NB: does not throw when clearing.
        row.prop('message').clear();
        row.prop('messages').clear();
      });

      it('clear', async () => {
        const { sheet } = await testSheetPrimitives();

        const cursor = await sheet.data().load();
        const row = cursor.row(0) as P;

        const prop = row.prop('stringValue');
        expect(prop.get()).to.eql('hello value');

        prop.clear();
        expect(prop.get()).to.eql('Hello (Default)');
      });
    });

    describe('read/write (inline)', () => {
      it('{ object }', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.data().load();
        const row = cursor.row(0).props;

        expect(row.title).to.eql('One');
        expect(row.color).to.eql({ label: 'background', color: 'red' });
        expect(row.isEnabled).to.eql(true);

        row.title = 'hello';
        row.color = { label: 'background', color: 'green', description: 'Yo' };

        expect(row.title).to.eql('hello');
        expect(row.color).to.eql({
          label: 'background',
          color: 'green',
          description: 'Yo',
        });

        row.title = '';
        row.color = undefined;

        expect(row.title).to.eql('');
        expect(row.color).to.eql(undefined);
      });

      describe('enum', () => {
        it('single', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.single).to.eql('hello');

          row.single = undefined;
          expect(row.single).to.eql(undefined);
        });

        it('union', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.union).to.eql(['blue']);

          row.union = 'red';
          expect(row.union).to.eql('red');

          row.union = ['blue', 'blue'];
          expect(row.union).to.eql(['blue', 'blue']);

          row.union = undefined as any; // 🐷HACK: until there is a proper way to clear.
          expect(row.union).to.eql(undefined);
        });

        it('array', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.array).to.eql(['red', 'green', 'blue']);

          row.array = undefined as any; // 🐷HACK: until there is a proper way to clear.
          expect(row.array).to.eql([]);
        });
      });

      describe('primitive', () => {
        it('string', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;

          expect(row.stringValue).to.eql('hello value');
          expect(row.stringProp).to.eql('hello prop');

          row.stringValue = '';
          row.stringProp = '';
          expect(row.stringValue).to.eql('');
          expect(row.stringProp).to.eql('');

          row.stringValue = 'Foo';
          row.stringProp = 'Bar';
          expect(row.stringValue).to.eql('Foo');
          expect(row.stringProp).to.eql('Bar');
        });

        it('number', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;

          expect(row.numberValue).to.eql(123);
          expect(row.numberProp).to.eql(456);

          row.numberValue = -1;
          row.numberProp = -1;
          expect(row.numberValue).to.eql(-1);
          expect(row.numberProp).to.eql(-1);
        });

        it('boolean', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.booleanValue).to.eql(true);
          expect(row.booleanProp).to.eql(true);

          row.booleanValue = false;
          row.booleanProp = false;
          expect(row.booleanValue).to.eql(false);
          expect(row.booleanProp).to.eql(false);
        });

        it('null', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.nullValue).to.eql(null);

          row.nullValue = 123;
          row.nullProp = 123;
          expect(row.nullValue).to.eql(123);
          expect(row.nullProp).to.eql(123);

          row.nullValue = null;
          row.nullProp = null;
          expect(row.nullValue).to.eql(null);
          expect(row.nullProp).to.eql(null);
        });

        it('undefined', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.data().load();
          const row = cursor.row(0).props;
          expect(row.undefinedValue).to.eql(undefined);
          expect(row.undefinedProp).to.eql(undefined);

          row.undefinedValue = 'hello';
          row.undefinedProp = 'hello';
          expect(row.undefinedValue).to.eql('hello');
          expect(row.undefinedProp).to.eql('hello');

          row.undefinedValue = undefined;
          row.undefinedProp = undefined;
          expect(row.undefinedValue).to.eql(undefined);
          expect(row.undefinedProp).to.eql(undefined);
        });
      });
    });

    describe('read/write (ref)', () => {
      describe('1:1', () => {
        it('single row', async () => {
          const { sheet } = await testSheet();
          const cursor = await sheet.data().load();
          const row = cursor.row(0);
          const message = row.props.message;
          expect(message).to.be.an.instanceof(TypedSheetRef);
          expect(row.props.message).to.equal(message); // NB: Cached instance.
        });
      });

      describe('1:*', () => {
        it('load ➔ ready', async () => {
          const { sheet } = await testSheet();
          const cursor = await sheet.data().load();
          const row = cursor.row(0);

          const messages = row.props.messages;
          expect(messages).to.be.an.instanceof(TypedSheetRefs);
          expect(row.props.messages).to.equal(messages); // NB: Cached instance.
          expect(messages.isReady).to.eql(false);

          const type = messages.typeDef.type;
          expect(type.kind).to.eql('REF');
          if (type.kind === 'REF') {
            expect(type.types[0].default).to.eql({ value: -1 });
            expect(type.types[1].default).to.eql({ value: 'anon' });
            expect(type.types[2].default).to.eql(undefined);
          }

          await messages.ready();
          expect(messages.isReady).to.eql(true);
          expect(messages.sheet).to.be.an.instanceof(TypedSheet);
          expect(messages.ns.toString()).to.eql(messages.sheet.uri.toString());
          expect(messages.sheet.types.map(def => def.prop)).to.eql(['date', 'user', 'message']);

          const childCursor = messages.sheet.data('1:10');
          await childCursor.ready();

          const childRow = childCursor.row(0);
          const childRowProps = childRow.props;

          expect(childRow.types.list).to.eql(messages.sheet.types);

          expect(childRowProps.message).to.eql(undefined);
          childRowProps.message = 'hello';
          childRowProps.user = 'bob';
          expect(childRowProps.message).to.eql('hello');
          expect(childRowProps.user).to.eql('bob');

          // Ensure the sheet is linked.
          const changes = sheet.state.changes;
          const changedLinks = changes.E1.to.links || {};
          expect(changedLinks['ref:type']).to.eql(messages.sheet.uri.toString());
        });

        it('throw: sheet called before ready', async () => {
          const { sheet } = await testSheet();
          const row = (await sheet.data().load()).row(0).props;
          const fn = () => row.messages.sheet;
          expect(fn).to.throw(/called before isReady/);
        });

        it('ready called only once', async () => {
          const { sheet } = await testSheet();
          const row = (await sheet.data().load()).row(0).props;
          const messages = row.messages;
          await Promise.all([messages.ready(), messages.ready(), messages.ready()]);
          expect(messages.isReady).to.eql(true);
        });

        it('has placeholder URI prior to being [ready]', async () => {
          const { sheet } = await testSheet();
          const cursor = await sheet.data().load();
          const messages = cursor.row(0).props.messages;

          expect(messages.isReady).to.eql(false);
          expect(messages.ns.toString()).to.eql(TypedSheetRefs.PLACEHOLDER);
          await messages.ready();
          expect(messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);
        });

        it('uses existing link', async () => {
          const { sheet } = await testSheet();
          const cursorA = await sheet.data('1:3').load();
          const cursorB = await sheet.data('1:10').load();

          const rowA = cursorA.row(0).props;
          await rowA.messages.ready();

          const rowB = cursorB.row(0).props;
          await rowB.messages.ready();

          expect(rowA.messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);
          expect(rowB.messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);

          expect(rowA.messages.ns.toString()).to.eql(rowB.messages.ns.toString());
        });

        it('ref.cursor(...): auto loads (await ready)', async () => {
          const { sheet } = await testSheet();
          const row = sheet.data().row(0).props;

          const cursor1 = await row.messages.cursor();
          const cursor2 = await row.messages.cursor('1:10');
          const cursor3 = await row.messages.cursor({});
          const cursor4 = await row.messages.cursor({ range: '1:5' });

          expect(cursor1.isReady).to.eql(true);
          expect(cursor2.isReady).to.eql(true);
          expect(cursor3.isReady).to.eql(true);
          expect(cursor4.isReady).to.eql(true);

          expect(cursor1.status).to.eql('LOADED');
          expect(cursor2.status).to.eql('LOADED');
          expect(cursor3.status).to.eql('LOADED');
          expect(cursor4.status).to.eql('LOADED');

          expect(cursor1.range).to.eql(TypedSheetData.DEFAULT.RANGE);
          expect(cursor2.range).to.eql('1:10');
          expect(cursor3.range).to.eql(TypedSheetData.DEFAULT.RANGE);
          expect(cursor4.range).to.eql('1:5');
        });

        it('ref.cursor(...): loaded props', async () => {
          const { sheet } = await testSheet();
          const row = sheet.data().row(0).props;
          const cursor = await row.messages.cursor();
          const childRow = cursor.row(0).props;

          childRow.message = 'hello';
          childRow.user = 'bob';
          expect(childRow.message).to.eql('hello');
          expect(childRow.user).to.eql('bob');
        });
      });
    });
  });

  describe('TypedSheetState', () => {
    it('exposed from sheet', async () => {
      const { sheet } = await testSheet();
      const state = sheet.state;
      expect(state.uri).to.eql(sheet.uri);
      expect(state).to.be.an.instanceof(TypedSheetState);
    });

    describe('getCell', () => {
      it('not found', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        const res = await state.getCell('ZZ99');
        expect(res).to.eql(undefined);
      });

      it('retrieve from fetch (then cache)', async () => {
        const { sheet, fetch } = await testSheet();
        const state = sheet.state;
        expect(fetch.getCellsCount).to.eql(0);

        const res = await state.getCell('A1');
        expect(res).to.eql({ value: 'One' });
        expect(fetch.getCellsCount).to.eql(1);

        await state.getCell('A1');
        expect(fetch.getCellsCount).to.eql(1); // NB: no change - cached.
      });

      it('throw: invalid key', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        expectError(async () => state.getCell('A'), 'Expected a cell key (eg "A1")');
      });
    });

    describe('ignores (no change)', () => {
      it('ignores different namespace', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.BAR:A1', data: { value: 123 } },
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('ignores non cell URIs', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'file:foo:abc', data: { value: 123 } },
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('ignores invalid URIs', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A-1', data: { value: 123 } }, // NB: invalid URI
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('disposed: no change', async () => {
        const { sheet, events$ } = await testSheet();
        expect(sheet.state.changes).to.eql({});

        sheet.dispose();

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 123 } },
        });

        await time.wait(1);
        expect(sheet.state.changes).to.eql({});
      });
    });

    describe('changes', () => {
      it('state.hasChanges', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.hasChanges).to.eql(false);

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 123 } },
        });

        await time.wait(1);
        expect(state.hasChanges).to.eql(true);
      });

      it('state.changes: initial state {empty}', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});
      });

      it('state.changes: new instance on each call', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        const res1 = state.changes;
        const res2 = state.changes;
        expect(res1).to.eql(res2);
        expect(res1).to.not.equal(res2); // NB: Different instance.
      });

      it('state.changes: pending change returned via [fetch]', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        const fetch = state.fetch;

        const get = async (key: string) => {
          const query = `${key}:${key}`;
          const res = await fetch.getCells({ ns: 'foo', query });
          return res.cells[key];
        };

        const res1 = await get('A1');
        expect(res1).to.eql({ value: 'One' });

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 123 } },
        });

        await time.wait(1);

        const res2 = await get('A1');
        expect(res2).to.eql({ value: 123 }); // NB: Overridden response (the pending change).
      });
    });

    describe('change (via event)', () => {
      it('change: cell (existing value)', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        const fired: t.ITypedSheetChanged[] = [];
        state.changed$.subscribe(e => fired.push(e));

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 123 } },
        });
        await time.wait(1);

        const change1 = state.changes.A1;
        expect(change1.cell).to.eql('cell:foo.mySheet:A1');
        expect(change1.from).to.eql({ value: 'One' });
        expect(change1.to).to.eql({ value: 123 });

        expect(fired.length).to.eql(1);
        expect(fired[0].change).to.eql(change1);
        expect(fired[0].changes).to.eql(state.changes);
        expect(fired[0].ns).to.eql('ns:foo.mySheet');

        // Retains original [from] value on second change (prior to purge).
        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 456 } },
        });
        await time.wait(1);

        const change2 = state.changes.A1;
        expect(change1.from).to.eql({ value: 'One' });
        expect(change2.to).to.eql({ value: 456 });

        // Does not fire changed event if no change.
        expect(fired.length).to.eql(2);
        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 456 } },
        });
        await time.wait(1);
        expect(fired.length).to.eql(2);
      });

      it('change: cell (no prior value)', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A99', data: { value: 123 } },
        });
        await time.wait(1);

        const change = state.changes.A99;
        expect(change.cell).to.eql('cell:foo.mySheet:A99');
        expect(change.from).to.eql({});
        expect(change.to).to.eql({ value: 123 });
      });
    });

    describe('cache/revert', () => {
      it('revertChanges', async () => {
        const { sheet, events$ } = await testSheet();
        const state = sheet.state;
        expect(await state.getCell('A1')).to.eql({ value: 'One' }); // Original value.

        events$.next({
          type: 'SHEET/change',
          payload: { cell: 'cell:foo.mySheet:A1', data: { value: 123 } },
        });
        await time.wait(1);

        expect(state.hasChanges).to.eql(true);
        const changes = state.changes;

        expect(await state.getCell('A1')).to.eql({ value: 123 });

        const fired: t.TypedSheetEvent[] = [];
        sheet.events$.subscribe(e => fired.push(e));

        state.clearChanges('REVERT');

        expect(state.hasChanges).to.eql(false);
        expect(state.changes).to.eql({});
        expect(fired.length).to.eql(1);
        expect(fired[0].type).to.eql('SHEET/changes/cleared');
        expect(await state.getCell('A1')).to.eql({ value: 'One' }); // NB: retrieving original value after revert.

        const e = fired[0].payload as t.ITypedSheetChangesCleared;
        expect(e.ns).to.eql('ns:foo.mySheet');
        expect(e.from).to.eql(changes);
        expect(e.to).to.eql({});
        expect(e.action).to.eql('REVERT');
      });

      it('clearCache (retain other items in cache)', async () => {
        const { sheet, fetch } = await testSheet();
        const state = sheet.state;
        const cache = (state.fetch as t.CachedFetcher).cache;

        expect(fetch.getCellsCount).to.eql(0);
        expect(await state.getCell('A1')).to.eql({ value: 'One' }); // Original value.
        expect(fetch.getCellsCount).to.eql(1);

        await state.getCell('A1');
        await state.getCell('A2');
        expect(fetch.getCellsCount).to.eql(2);

        cache.put('foo', 123);

        state.clearCache();
        expect(cache.keys).to.eql(['foo']); // NB: Retained non-cell key.

        await state.getCell('A1');
        expect(fetch.getCellsCount).to.eql(3); // NB: re-fetched.
        await state.getCell('A1');
        expect(fetch.getCellsCount).to.eql(3); // NB: and back in the cache!
      });
    });
  });
});

/**
 * Test Data
 */

const testFetchMySheet = (ns: string) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo',
    defs: TYPE_DEFS,
    cells: { A9: { value: 'Nine' } },
    rows: [
      {
        title: 'One',
        isEnabled: true,
        color: { label: 'background', color: 'red' },
        message: null,
        messages: [],
      },
      {
        title: 'Two',
        isEnabled: false,
        color: { label: 'foreground', color: 'blue' },
        message: null,
        messages: [],
      },
    ],
  });
};

const testFetchPrimitives = (ns: string) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo.primitives',
    defs: TYPE_DEFS,
    rows: [
      {
        stringValue: 'hello value',
        numberValue: 123,
        booleanValue: true,
        nullValue: null,
        undefinedValue: undefined,

        stringProp: 'hello prop',
        numberProp: 456,
        booleanProp: true,
        nullProp: null,
        undefinedProp: undefined,
      },
    ],
  });
};

const testFetchEnum = (ns: string) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo.enum',
    defs: TYPE_DEFS,
    rows: [
      {
        single: 'hello',
        union: ['blue'],
        array: ['red', 'green', 'blue'],
      },
    ],
  });
};

const testSheet = async () => {
  const ns = 'ns:foo.mySheet';
  const events$ = new Subject<t.TypedSheetEvent>();
  const fetch = await testFetchMySheet(ns);
  const sheet = await TypeSystem.Sheet.load<f.MyRow>({ fetch, ns, events$ });
  return { ns, fetch, sheet, events$ };
};

const testSheetPrimitives = async () => {
  const ns = 'ns:foo.myPrimitives';
  const fetch = await testFetchPrimitives(ns);
  const sheet = await TypeSystem.Sheet.load<p.Primitives>({ fetch, ns });
  return { ns, fetch, sheet };
};

const testSheetEnum = async () => {
  const ns = 'ns:foo.myEnum';
  const fetch = await testFetchEnum(ns);
  const sheet = await TypeSystem.Sheet.load<e.Enum>({ fetch, ns });
  return { ns, fetch, sheet };
};
