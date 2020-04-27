import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

import { TypedSheet } from '.';
import { ERROR, expect, expectError, t, testInstanceFetch, time, TYPE_DEFS } from '../../test';
import * as f from '../../test/.d.ts/foo';
import * as e from '../../test/.d.ts/foo.enum';
import * as d from '../../test/.d.ts/foo.defaults';
import * as p from '../../test/.d.ts/foo.primitives';
import * as m from '../../test/.d.ts/foo.multi';
import { TypeClient } from '../TypeClient';
import { TypedSheetData } from './TypedSheetData';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';
import { TypedSheetRow } from './TypedSheetRow';
import { TypedSheetState, TypedSheetStateInternal } from './TypedSheetState';

/**
 * TODO 🐷 Features
 * - error check typename on NS upon writing (Captialised, no spaces)
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - read/write: linked sheet
 * - data/cursor - put of [types] field: equivalent  row-types object on it.
 */

describe('TypedSheet', () => {
  describe('lifecycle', () => {
    it('dispose', async () => {
      const { sheet } = await testMySheet();

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
      const sheet = await TypedSheet.load({ fetch, ns });

      expect(sheet.ok).to.eql(false);
      expect(sheet.errors.length).to.eql(1);

      expect(sheet.errors[0].message).to.include(`The namespace (ns:foo.notExist) does not exist`);
      expect(sheet.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
    });

    it('error: `sheet.data(typename)` requested where typename not part of ns', async () => {
      const { sheet } = await testMySheet();
      const fn = () => sheet.data('NOT_A_TYPENAME');
      expect(fn).to.throw(/Definitions for typename 'NOT_A_TYPENAME' not found/);
    });
  });

  describe('TypedSheet.types', () => {
    it('single type', async () => {
      const { sheet } = await testMySheet();
      expect(sheet.types.map(type => type.typename)).to.eql(['MyRow']);
    });

    it('multiple types', async () => {
      const { sheet } = await testMyMultiSheet();
      expect(sheet.types.map(type => type.typename)).to.eql(['MyOne', 'MyTwo']);
    });

    it('calculated once (lazy evaluation, shared instance)', async () => {
      const { sheet } = await testMyMultiSheet();
      const res1 = sheet.types;
      const res2 = sheet.types;
      expect(res1).to.equal(res2);
    });
  });

  describe('TypedSheetData (cursor)', () => {
    it('create: default (unloaded)', async () => {
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');
      expect(cursor.range).to.eql(TypedSheetData.DEFAULT.RANGE);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);
      expect(cursor.typename).to.eql('MyRow');
    });

    it('typename/types', async () => {
      const { sheet } = await testMyMultiSheet();
      const cursor1 = sheet.data('MyOne');
      const cursor2 = sheet.data('MyTwo');

      expect(cursor1.typename).to.eql('MyOne');
      expect(cursor1.types.map(def => def.prop)).to.eql(['title', 'foo']);
      expect(cursor1.types.map(def => def.column)).to.eql(['A', 'B']);

      expect(cursor2.typename).to.eql('MyTwo');
      expect(cursor2.types.map(def => def.prop)).to.eql(['bar', 'name']);
      expect(cursor2.types.map(def => def.column)).to.eql(['B', 'C']);
    });

    it('create: custom range (auto correct)', async () => {
      const { sheet } = await testMySheet();
      const DEFAULT = TypedSheetData.DEFAULT;

      const test = (range: string, expected?: string) => {
        const res = sheet.data({ typename: 'MyRow', range });
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
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');

      expect(cursor.isLoaded).to.eql(false);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);
      expect(cursor.typename).to.eql('MyRow');

      expect(cursor.row(0).isLoaded).to.eql(false);

      const wait = cursor.load();

      expect(cursor.status).to.eql('LOADING');
      expect(cursor.total).to.eql(-1);

      await wait;

      expect(cursor.status).to.eql('LOADED');
      expect(cursor.isLoaded).to.eql(true);
      expect(cursor.total).to.eql(9);

      expect(cursor.row(0).isLoaded).to.eql(true);
      expect(cursor.row(8).isLoaded).to.eql(true);
      expect(cursor.row(9).isLoaded).to.eql(false);
    });

    it('load (subset)', async () => {
      const { sheet } = await testMySheet();
      const cursor = await sheet.data({ typename: 'MyRow', range: '2:5' }).load();
      expect(cursor.row(0).isLoaded).to.eql(false);
      expect(cursor.row(1).isLoaded).to.eql(true);
      expect(cursor.row(4).isLoaded).to.eql(true);
      expect(cursor.row(5).isLoaded).to.eql(false);
    });

    it('load (expand range from [loaded] state)', async () => {
      const { sheet } = await testMySheet();
      const cursor = await sheet.data({ typename: 'MyRow', range: '1:5' }).load();

      expect(cursor.isLoaded).to.eql(true);
      expect(cursor.range).to.eql('1:5');

      expect(cursor.row(0).isLoaded).to.eql(true);
      expect(cursor.row(8).isLoaded).to.eql(false);

      await cursor.load('3:15');

      expect(cursor.range).to.eql('1:15'); //           NB: includes the initial load (starting at 1 not 3).
      expect(cursor.row(8).isLoaded).to.eql(true); //   NB: Now loaded.
      expect(cursor.row(14).isLoaded).to.eql(false); // NB: does not exist yet.
    });

    it('load (reset range from [unloaded] state)', async () => {
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');

      expect(cursor.isLoaded).to.eql(false);
      expect(cursor.range).to.eql(TypedSheetData.DEFAULT.RANGE);

      await cursor.load('3:15');
      expect(cursor.isLoaded).to.eql(true);
      expect(cursor.range).to.eql('3:15'); // NB: starts at the initial loaded range.

      expect(cursor.row(0).isLoaded).to.eql(false);
      expect(cursor.row(1).isLoaded).to.eql(false);
      expect(cursor.row(2).isLoaded).to.eql(true);
      expect(cursor.row(8).isLoaded).to.eql(true);
      expect(cursor.row(14).isLoaded).to.eql(false); // NB: does not exist yet.
    });

    it('load (multiple types)', async () => {
      const { sheet } = await testMyMultiSheet();
      const cursor1 = sheet.data<m.MyOne>('MyOne');
      const cursor2 = sheet.data<m.MyTwo>('MyTwo');
      expect(cursor1.row(0).props.foo).to.eql('foo-default');
      expect(cursor2.row(9).props.bar).to.eql('bar-default');
    });

    it('events: loading | loaded', async () => {
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');

      const fired: t.TypedSheetEvent[] = [];
      sheet.event$
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
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');
      const fired: t.TypedSheetEvent[] = [];
      sheet.event$
        .pipe(filter(e => e.type === 'SHEET/loading' || e.type === 'SHEET/loaded'))
        .subscribe(e => fired.push(e));

      await Promise.all([cursor.load(), cursor.load(), cursor.load()]);
      expect(fired.length).to.eql(2); // NB: Would be 6 if load de-duping wan't implemented.
    });

    it('does load twice if query differs', async () => {
      const { sheet } = await testMySheet();
      const cursor = sheet.data('MyRow');
      const fired: t.TypedSheetEvent[] = [];
      sheet.event$
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

    it('throw: row out-of-bounds (index: -1)', async () => {
      const { sheet } = await testMySheet();
      const cursor = await sheet.data('MyRow').load();
      const err = /Row index must be >=0/;
      expect(() => cursor.row(-1)).to.throw(err);
    });

    it('exists', async () => {
      const { sheet } = await testMySheet();
      const cursor = await sheet.data('MyRow').load();

      expect(cursor.exists(-1)).to.eql(false);
      expect(cursor.exists(0)).to.eql(true);
      expect(cursor.exists(99)).to.eql(false);
    });

    it('retrieves non-existent row', async () => {
      const { sheet } = await testMySheet();
      const cursor = await sheet.data('MyRow').load();
      expect(cursor.exists(99)).to.eql(false);
      expect(cursor.row(99)).to.not.eql(undefined);
    });

    it('toObject', async () => {
      const { sheet } = await testMyEnumSheet();
      const row = (await sheet.data('Enum').load()).row(0);
      expect(row.toObject()).to.eql({
        single: 'hello',
        union: ['blue'],
        array: ['red', 'green', 'blue'],
      });
    });
  });

  describe('TypedSheetRow', () => {
    const testRow = async (uri: string) => {
      const fetch = await testFetchMySheet('ns:foo.mySheet');
      const ctx = TypedSheet.ctx({ fetch });
      const ns = await TypeClient.load({ ns: 'ns:foo', fetch: ctx.fetch, cache: ctx.cache });
      const defs = ns.defs;
      const columns = ns.defs[0].columns;
      const typename = 'MyRow';
      const row = TypedSheetRow.create<f.MyRow>({ typename, uri, columns, ctx });
      return { row, ctx, defs };
    };

    it('throw: URI not a row', async () => {
      expectError(async () => testRow('cell:foo:A1'));
      expectError(async () => testRow('ns:foo'));
      expectError(async () => testRow('file:foo:abc'));
    });

    it('create (not loaded)', async () => {
      const { row, defs } = await testRow('cell:foo:1');
      expect(row.uri.toString()).to.eql('cell:foo:1');
      expect(row.typename).to.eql('MyRow');
      expect(row.index).to.eql(0);

      expect(row.status).to.eql('INIT');
      expect(row.isLoaded).to.eql(false);

      expect(row.types.list).to.eql(defs[0].columns);
      expect(row.types.map.title.column).to.eql('A');

      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);
    });

    it('load', async () => {
      const { row } = await testRow('cell:foo:1');

      expect(row.typename).to.eql('MyRow');
      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);
      expect(row.isLoaded).to.eql(false);
      expect(row.status).to.eql('INIT');

      const res = row.load();

      expect(row.isLoaded).to.eql(false);
      expect(row.status).to.eql('LOADING');

      await res;

      expect(row.isLoaded).to.eql(true);
      expect(row.status).to.eql('LOADED');

      expect(row.props.title).to.eql('One');
      expect(row.props.isEnabled).to.eql(true);
    });

    it('load (static)', async () => {
      const { defs, ctx } = await testRow('cell:foo:1');
      const uri = 'cell:foo:1';
      const columns = defs[0].columns;
      const typename = 'MyRow';
      const row = await TypedSheetRow.load<f.MyRow>({ typename, uri, columns, ctx });

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
      ctx.event$.next({
        type: 'SHEET/change',
        payload: {
          kind: 'CELL',
          ns: 'ns:foo',
          key: 'A1',
          to: { value: 'Hello!' },
        },
      });
      expect(row.props.title).to.eql('Hello!'); // NB: Row state reflects external event change.

      row.props.title = 'Foobar';
      expect(row.props.title).to.eql('Foobar'); // NB: Update via prop (normal behavior).
    });

    describe('row event$', () => {
      it('fires load events', async () => {
        const { sheet } = await testMySheet();
        const cursor = sheet.data('MyRow');

        const fired: t.TypedSheetEvent[] = [];
        sheet.event$
          .pipe(filter(e => e.type === 'SHEET/row/loading' || e.type === 'SHEET/row/loaded'))
          .subscribe(e => fired.push(e));

        await cursor.load();

        const loading = fired.filter(e => e.type === 'SHEET/row/loading');
        const loaded = fired.filter(e => e.type === 'SHEET/row/loaded');

        expect(loading.length).to.eql(9);
        expect(loaded.length).to.eql(9);
      });

      it('repeat loads', async () => {
        const { sheet } = await testMySheet();
        const cursor = sheet.data('MyRow');

        const fired: t.TypedSheetEvent[] = [];
        sheet.event$
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
        const { sheet } = await testMySheet();
        const cursor = sheet.data('MyRow');
        const row = cursor.row(0);

        const fired: t.TypedSheetEvent[] = [];
        sheet.event$
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

      it('fires on row property set (only when changed)', async () => {
        const { sheet } = await testMySheet();
        const cursor = sheet.data('MyRow');
        const row = cursor.row(0);

        await row.load();

        const fired: t.TypedSheetEvent[] = [];
        sheet.event$.subscribe(e => fired.push(e));

        row.props.title = 'Foo';
        expect(fired.length).to.eql(1);
        expect(fired[0].type).to.eql('SHEET/change');

        row.props.title = 'Foo';
        expect(fired.length).to.eql(1); // NB: No change.
      });
    });

    describe('row types', () => {
      it('row.types.list', async () => {
        const { sheet } = await testMySheet();
        const cursor = await sheet.data('MyRow').load();
        const types = cursor.row(0).types;

        const list1 = types.list;
        const list2 = types.list;

        expect(list1).to.equal(list2); // Lazily evalutated, common instance returned.
        expect(list1.map(def => def.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
      });

      it('row.types.map', async () => {
        const { sheet } = await testMySheet();
        const cursor = await sheet.data('MyRow').load();
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
        const { sheet } = await testMyPrimitivesSheet();
        const cursor = await sheet.data<p.Primitives>('Primitives').load();

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

        const sheet = await TypedSheet.load({ fetch, ns });
        const cursor = await sheet.data<d.MyDefault>('MyDefault').load();
        expect(cursor.exists(99)).to.eql(false);
      });
    });

    describe('row.prop (get/set methods)', () => {
      type P = TypedSheetRow<p.Primitives>;
      type R = TypedSheetRow<f.MyRow>;

      it('reuse api instance', async () => {
        const { sheet } = await testMyPrimitivesSheet();
        const row = (await sheet.data('Primitives').load()).row(0) as P;

        const prop1 = row.prop('numberProp');
        const prop2 = row.prop('numberProp');
        const prop3 = row.prop('stringValue');

        expect(prop1).to.equal(prop2);
        expect(prop1).to.not.equal(prop3);
      });

      it('get', async () => {
        const { sheet } = await testMyPrimitivesSheet();
        const cursor = await sheet.data('Primitives').load();

        const prop1 = (cursor.row(0) as P).prop('stringValue');
        const prop2 = (cursor.row(99) as P).prop('stringValue');

        expect(prop1.get()).to.eql('hello value');
        expect(prop2.get()).to.eql('Hello (Default)');
      });

      it('set', async () => {
        const { sheet } = await testMyPrimitivesSheet();
        const cursor = await sheet.data('Primitives').load();
        const prop = (cursor.row(0) as P).prop('stringValue');
        const state = sheet.state as TypedSheetStateInternal;

        prop.set('');
        expect(prop.get()).to.eql(''); // NB: Immediate

        expect(await state.getCell('A1')).to.eql({ value: 'hello value' }); // NB: Fetch-cache still has the old value.
        await time.wait(1);
        expect(await state.getCell('A1')).to.eql({ value: '' }); // NB: and not the fetch-cache is updated.

        prop.set(' ');
        expect(prop.get()).to.eql(' ');

        prop.set('foo');
        expect(prop.get()).to.eql('foo');
      });

      it('set: throw if attempt to set ref', async () => {
        const { sheet } = await testMySheet();
        const cursor = await sheet.data('MyRow').load();
        const row = cursor.row(0) as R;
        expect(() => row.prop('messages').set({} as any)).to.throw(/Cannot write to property/);
        expect(() => row.prop('message').set({} as any)).to.throw(/Cannot write to property/);

        // NB: does not throw when clearing.
        row.prop('message').clear();
        row.prop('messages').clear();
      });

      it('clear', async () => {
        const { sheet } = await testMyPrimitivesSheet();

        const cursor = await sheet.data('Primitives').load();
        const row = cursor.row(0) as P;

        const prop = row.prop('stringValue');
        expect(prop.get()).to.eql('hello value');

        prop.clear();
        expect(prop.get()).to.eql('Hello (Default)');
      });
    });

    describe('read/write (inline)', () => {
      it('{ object }', async () => {
        const { sheet } = await testMySheet();
        const cursor = await sheet.data('MyRow').load();
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
          const { sheet } = await testMyEnumSheet();
          const cursor = await sheet.data('Enum').load();
          const row = cursor.row(0).props;
          expect(row.single).to.eql('hello');

          row.single = undefined;
          expect(row.single).to.eql(undefined);
        });

        it('union', async () => {
          const { sheet } = await testMyEnumSheet();
          const cursor = await sheet.data('Enum').load();
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
          const { sheet } = await testMyEnumSheet();
          const cursor = await sheet.data('Enum').load();
          const row = cursor.row(0).props;
          expect(row.array).to.eql(['red', 'green', 'blue']);

          row.array = undefined as any; // 🐷HACK: until there is a proper way to clear.
          expect(row.array).to.eql([]);
        });
      });

      describe('primitive', () => {
        it('string', async () => {
          const { sheet } = await testMyPrimitivesSheet();
          const cursor = await sheet.data('Primitives').load();
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
          const { sheet } = await testMyPrimitivesSheet();
          const cursor = await sheet.data('Primitives').load();
          const row = cursor.row(0).props;

          expect(row.numberValue).to.eql(123);
          expect(row.numberProp).to.eql(456);

          row.numberValue = -1;
          row.numberProp = -1;
          expect(row.numberValue).to.eql(-1);
          expect(row.numberProp).to.eql(-1);
        });

        it('boolean', async () => {
          const { sheet } = await testMyPrimitivesSheet();
          const cursor = await sheet.data('Primitives').load();
          const row = cursor.row(0).props;
          expect(row.booleanValue).to.eql(true);
          expect(row.booleanProp).to.eql(true);

          row.booleanValue = false;
          row.booleanProp = false;
          expect(row.booleanValue).to.eql(false);
          expect(row.booleanProp).to.eql(false);
        });

        it('null', async () => {
          const { sheet } = await testMyPrimitivesSheet();
          const cursor = await sheet.data('Primitives').load();
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
          const { sheet } = await testMyPrimitivesSheet();
          const cursor = await sheet.data('Primitives').load();
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
          const { sheet } = await testMySheet();
          const cursor = await sheet.data('MyRow').load();
          const row = cursor.row(0);
          const message = row.props.message;
          expect(message).to.be.an.instanceof(TypedSheetRef);
          expect(message?.typename).to.eql('MyMessage | null');
          expect(message).to.equal(row.props.message); // NB: Cached instance.
        });
      });

      describe('1:*', () => {
        it('load ➔ ready (loaded)', async () => {
          const { sheet } = await testMySheet();
          const cursor = await sheet.data('MyRow').load();
          const row = cursor.row(0);

          const messages = row.props.messages;
          expect(messages).to.be.an.instanceof(TypedSheetRefs);
          expect(row.props.messages).to.equal(messages); // NB: Cached instance.
          expect(messages.isLoaded).to.eql(false);
          expect(messages.typename).to.eql('MyMessage');

          const type = messages.typeDef.type;
          expect(type.kind).to.eql('REF');
          if (type.kind === 'REF') {
            expect(type.types[0].default).to.eql({ value: -1 });
            expect(type.types[1].default).to.eql({ value: 'anon' });
            expect(type.types[2].default).to.eql(undefined);
          }

          await messages.load();
          expect(messages.isLoaded).to.eql(true);
          expect(messages.sheet).to.be.an.instanceof(TypedSheet);
          expect(messages.ns.toString()).to.eql(messages.sheet.uri.toString());

          const childCursor = await messages.data({ range: '1:10' });
          const childRow = childCursor.row(0);
          const childRowProps = childRow.props;

          expect(childRow.types.list).to.eql(messages.sheet.types[0].columns);

          expect(childRowProps.message).to.eql(undefined);
          childRowProps.message = 'hello';
          childRowProps.user = 'bob';
          expect(childRowProps.message).to.eql('hello');
          expect(childRowProps.user).to.eql('bob');

          // Ensure the sheet is linked.
          const changes = sheet.state.changes;
          const changedLinks = changes.cells?.E1.to.links || {};
          expect(changedLinks['ref:type']).to.eql(messages.sheet.uri.toString());
        });

        it('throw: sheet called before ready (loaded)', async () => {
          const { sheet } = await testMySheet();
          const row = (await sheet.data('MyRow').load()).row(0).props;
          const fn = () => row.messages.sheet;
          expect(fn).to.throw(/called before ready \[isLoaded\]/);
        });

        it('load called only once', async () => {
          const { sheet } = await testMySheet();
          const row = (await sheet.data('MyRow').load()).row(0).props;
          const messages = row.messages;
          await Promise.all([messages.load(), messages.load(), messages.load()]);
          expect(messages.isLoaded).to.eql(true);
        });

        it('has placeholder URI prior to being ready (loaded)', async () => {
          const { sheet } = await testMySheet();
          const cursor = await sheet.data('MyRow').load();
          const messages = cursor.row(0).props.messages;

          expect(messages.isLoaded).to.eql(false);
          expect(messages.ns.toString()).to.eql(TypedSheetRefs.PLACEHOLDER);
          await messages.load();
          expect(messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);
        });

        it('uses existing link', async () => {
          const { sheet } = await testMySheet();
          const cursorA = await sheet.data({ typename: 'MyRow', range: '1:3' }).load();
          const cursorB = await sheet.data({ typename: 'MyRow', range: '1:10' }).load();

          const rowA = cursorA.row(0).props;
          await rowA.messages.load();

          const rowB = cursorB.row(0).props;
          await rowB.messages.load();

          expect(rowA.messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);
          expect(rowB.messages.ns.toString()).to.not.eql(TypedSheetRefs.PLACEHOLDER);

          expect(rowA.messages.ns.toString()).to.eql(rowB.messages.ns.toString());
        });

        it('ref.data(...): auto loads (await load)', async () => {
          const { sheet } = await testMySheet();
          const row = sheet.data('MyRow').row(0).props;

          const cursor1 = await row.messages.data();
          const cursor2 = await row.messages.data({});
          const cursor3 = await row.messages.data({ range: '1:5' });

          expect(cursor1.typename).to.eql('MyMessage');
          expect(cursor2.typename).to.eql('MyMessage');
          expect(cursor3.typename).to.eql('MyMessage');

          expect(cursor1.isLoaded).to.eql(true);
          expect(cursor2.isLoaded).to.eql(true);
          expect(cursor3.isLoaded).to.eql(true);

          expect(cursor1.status).to.eql('LOADED');
          expect(cursor2.status).to.eql('LOADED');
          expect(cursor3.status).to.eql('LOADED');

          expect(cursor1.range).to.eql(TypedSheetData.DEFAULT.RANGE);
          expect(cursor2.range).to.eql(TypedSheetData.DEFAULT.RANGE);
          expect(cursor3.range).to.eql('1:5');
        });

        it('ref.data(...): loaded props', async () => {
          const { sheet } = await testMySheet();
          const row = sheet.data('MyRow').row(0).props;
          const cursor = await row.messages.data();
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
      const { sheet } = await testMySheet();
      const state = sheet.state;
      expect(state.uri).to.eql(sheet.uri);
      expect(state).to.be.an.instanceof(TypedSheetState);
    });

    describe('internal: getCell', () => {
      it('not found', async () => {
        const { sheet } = await testMySheet();
        const state = sheet.state as TypedSheetStateInternal;
        const res = await state.getCell('ZZ99');
        expect(res).to.eql(undefined);
      });

      it('retrieve from fetch (then cache)', async () => {
        const { sheet, fetch } = await testMySheet();
        const state = sheet.state as TypedSheetStateInternal;
        expect(fetch.getCellsCount).to.eql(0);

        const res = await state.getCell('A1');
        expect(res).to.eql({ value: 'One' });
        expect(fetch.getCellsCount).to.eql(1);

        await state.getCell('A1');
        expect(fetch.getCellsCount).to.eql(1); // NB: no change - cached.
      });

      it('throw: invalid key', async () => {
        const { sheet } = await testMySheet();
        const state = sheet.state as TypedSheetStateInternal;
        expectError(async () => state.getCell('A'), 'Expected a cell key (eg "A1")');
      });

      describe('internal: getNs', () => {
        it('retrieve from fetch (then cache)', async () => {
          const { sheet, fetch } = await testMySheet();
          const state = sheet.state as TypedSheetStateInternal;
          fetch.getNsCount = 0;
          const res = await state.getNs();
          expect(res).to.eql(undefined);
          expect(fetch.getNsCount).to.eql(1);
          await state.getNs();
          expect(fetch.getNsCount).to.eql(1); // NB: no change - cached.
        });
      });
    });

    describe('ignores (no change)', () => {
      it('ignores different namespace', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.BAR', key: 'A1', to: { value: 123 } },
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('ignores non cell URIs', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'file:foo:abc', key: 'A1', to: { value: 123 } },
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('ignores invalid URIs', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:not-valid*', key: 'A1', to: { value: 123 } }, // NB: invalid URI
        });

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo', key: 'A-1', to: { value: 123 } }, // NB: invalid URI
        });

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo:A1', key: 'A1', to: { value: 123 } }, // NB: invalid URI
        });

        await time.wait(1);
        expect(state.changes).to.eql({});
      });

      it('disposed: no change', async () => {
        const { sheet, event$ } = await testMySheet();
        expect(sheet.state.changes).to.eql({});

        sheet.dispose();

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 123 } },
        });

        await time.wait(1);
        expect(sheet.state.changes).to.eql({});
      });
    });

    describe('changes', () => {
      it('hasChanges: cell', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.hasChanges).to.eql(false);

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 123 } },
        });

        await time.wait(1);
        expect(state.hasChanges).to.eql(true);
      });

      it('hasChanges: ns', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.hasChanges).to.eql(false);

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'NS', ns: 'ns:foo.mySheet', to: { type: { implements: 'foobar' } } },
        });

        await time.wait(1);
        expect(state.hasChanges).to.eql(true);
      });

      it('state.changes: initial state {empty}', async () => {
        const { sheet } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});
      });

      it('state.changes: new instance on each call', async () => {
        const { sheet } = await testMySheet();
        const state = sheet.state;
        const res1 = state.changes;
        const res2 = state.changes;
        expect(res1).to.eql(res2);
        expect(res1).to.not.equal(res2); // NB: Different instance.
      });

      it('state.changes: pending change returned via [fetch]', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        const fetch = state.fetch;

        const get = async (key: string) => {
          const query = `${key}:${key}`;
          const res = await fetch.getCells({ ns: 'foo', query });
          return (res.cells || {})[key];
        };

        const res1 = await get('A1');
        expect(res1).to.eql({ value: 'One' });

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 123 } },
        });

        await time.wait(1);

        const res2 = await get('A1');
        expect(res2).to.eql({ value: 123 }); // NB: Overridden response (the pending change).
      });
    });

    describe('change (via event)', () => {
      it('change ns', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        const ns = 'ns:foo.mySheet';
        const type = { implements: 'foobar' };
        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'NS', ns, to: { type } },
        });
        await time.wait(1);

        const changes = state.changes;
        expect(changes.ns?.kind).to.eql('NS');
        expect(changes.ns?.ns).to.eql(ns);
        expect(changes.ns?.from).to.eql({});
        expect(changes.ns?.to).to.eql({ type });
      });

      it('change cell (existing value)', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        const fired: t.ITypedSheetChanged[] = [];
        state.changed$.subscribe(e => fired.push(e));

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 123 } },
        });
        await time.wait(1);

        const change1 = state.changes.cells?.A1;
        expect(change1?.kind).to.eql('CELL');
        expect(change1?.ns).to.eql('ns:foo.mySheet');
        expect(change1?.key).to.eql('A1');
        expect(change1?.from).to.eql({ value: 'One' });
        expect(change1?.to).to.eql({ value: 123 });

        expect(fired.length).to.eql(1);
        expect(fired[0].change).to.eql(change1);
        expect(fired[0].changes).to.eql(state.changes);
        expect(fired[0].ns).to.eql('ns:foo.mySheet');

        // Retains original [from] value on second change (prior to purge).
        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 456 } },
        });
        await time.wait(1);

        const change2 = state.changes.cells?.A1;
        expect(change1?.from).to.eql({ value: 'One' });
        expect(change2?.to).to.eql({ value: 456 });

        // Does not fire changed event if no change.
        expect(fired.length).to.eql(2);
        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 456 } },
        });
        await time.wait(1);
        expect(fired.length).to.eql(2);
      });

      it('change cell (no prior value)', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A99', to: { value: 123 } },
        });
        await time.wait(1);

        const change = state.changes.cells?.A99;
        expect(change?.kind).to.eql('CELL');
        expect(change?.ns).to.eql('ns:foo.mySheet');
        expect(change?.key).to.eql('A99');
        expect(change?.from).to.eql({});
        expect(change?.to).to.eql({ value: 123 });
      });
    });

    describe('cache/revert', () => {
      it('revertChanges (cells and ns)', async () => {
        const { sheet, event$ } = await testMySheet();
        const state = sheet.state as TypedSheetStateInternal;

        // Original value.
        expect(await state.getCell('A1')).to.eql({ value: 'One' });
        expect(await state.getNs()).to.eql(undefined);

        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'CELL', ns: 'ns:foo.mySheet', key: 'A1', to: { value: 123 } },
        });
        event$.next({
          type: 'SHEET/change',
          payload: { kind: 'NS', ns: 'ns:foo.mySheet', to: { type: { implements: 'foobar' } } },
        });
        await time.wait(1);

        expect(state.hasChanges).to.eql(true);
        const changes = state.changes;

        expect(await state.getCell('A1')).to.eql({ value: 123 });
        expect(await state.getNs()).to.eql({ type: { implements: 'foobar' } });

        const fired: t.TypedSheetEvent[] = [];
        sheet.event$.subscribe(e => fired.push(e));

        state.clearChanges('REVERT');

        expect(state.hasChanges).to.eql(false);
        expect(state.changes).to.eql({});
        expect(fired.length).to.eql(1);
        expect(fired[0].type).to.eql('SHEET/changes/cleared');

        // NB: retrieving original value after revert.
        expect(await state.getCell('A1')).to.eql({ value: 'One' });
        expect(await state.getNs()).to.eql(undefined);

        const e = fired[0].payload as t.ITypedSheetChangesCleared;
        expect(e.ns).to.eql('ns:foo.mySheet');
        expect(e.from).to.eql(changes);
        expect(e.to).to.eql({});
        expect(e.action).to.eql('REVERT');
      });

      it('clearCache (retain other items in cache)', async () => {
        const { sheet, fetch } = await testMySheet();
        const state = sheet.state as TypedSheetStateInternal;
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
 * HELPERS: Test Data
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

const testFetchMulti = (ns: string) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo.multi',
    defs: TYPE_DEFS,
    rows: [],
  });
};

const testMySheet = async () => {
  const ns = 'ns:foo.mySheet';
  const event$ = new Subject<t.TypedSheetEvent>();
  const fetch = await testFetchMySheet(ns);
  const sheet = await TypedSheet.load<f.MyRow>({ fetch, ns, event$ });
  return { ns, fetch, sheet, event$ };
};

const testMyPrimitivesSheet = async () => {
  const ns = 'ns:foo.myPrimitives';
  const fetch = await testFetchPrimitives(ns);
  const sheet = await TypedSheet.load<p.Primitives>({ fetch, ns });
  return { ns, fetch, sheet };
};

const testMyEnumSheet = async () => {
  const ns = 'ns:foo.myEnum';
  const fetch = await testFetchEnum(ns);
  const sheet = await TypedSheet.load<e.Enum>({ fetch, ns });
  return { ns, fetch, sheet };
};

const testMyMultiSheet = async () => {
  const ns = 'ns:foo.myMulti';
  const fetch = await testFetchMulti(ns);
  const sheet = await TypedSheet.load<e.Enum>({ fetch, ns });
  return { ns, fetch, sheet };
};
