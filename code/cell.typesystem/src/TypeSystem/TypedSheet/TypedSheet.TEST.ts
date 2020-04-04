import { TypeSystem } from '..';
import {
  ERROR,
  expect,
  expectError,
  Subject,
  t,
  testInstanceFetch,
  time,
  TYPE_DEFS,
} from '../../test';
import * as f from '../../test/.d.ts/foo';
import * as d from '../../test/.d.ts/foo.defaults';
import * as m from '../../test/.d.ts/foo.messages';
import * as p from '../../test/.d.ts/foo.primitives';
import * as e from '../../test/.d.ts/foo.enum';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';
import { TypedSheetState } from './TypedSheetState';
import { TypedSheetRow } from './TypedSheetRow';
import { TypedSheetCursor } from './TypedSheetCursor';
import { TypedSheet } from '.';
import { TypeClient } from '../TypeClient';

/**
 * TODO 🐷 Features
 * - error check typename on NS upon writing (Captialised, no spaces)
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - change handler (pending => save)
 * - read/write: linked sheet
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
      const sheet = await TypeSystem.Sheet.load<f.MyRow>({ fetch, ns });

      expect(sheet.ok).to.eql(false);
      expect(sheet.errors[0].message).to.include(`The namespace "ns:foo.notExist" does not exist`);
      expect(sheet.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
    });
  });

  describe('cursor', () => {
    it('create: default (unloaded)', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.cursor();
      expect(cursor.range).to.eql(TypedSheetCursor.DEFAULT.RANGE);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);
    });

    it('create: custom range (auto correct)', async () => {
      const { sheet } = await testSheet();
      const DEFAULT = TypedSheetCursor.DEFAULT;

      const test = (range: string, expected?: string) => {
        const res = sheet.cursor(range);
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
      const cursor = sheet.cursor();

      expect(cursor.isLoaded).to.eql(false);
      expect(cursor.status).to.eql('INIT');
      expect(cursor.total).to.eql(-1);

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
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor('2:5').load();
      expect(cursor.row(0).isLoaded).to.eql(false);
      expect(cursor.row(1).isLoaded).to.eql(true);
      expect(cursor.row(4).isLoaded).to.eql(true);
      expect(cursor.row(5).isLoaded).to.eql(false);
    });

    it('load (expand range from [loaded] state)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor('1:5').load();

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
      const { sheet } = await testSheet();
      const cursor = sheet.cursor();

      expect(cursor.isLoaded).to.eql(false);
      expect(cursor.range).to.eql(TypedSheetCursor.DEFAULT.RANGE);

      await cursor.load('3:15');
      expect(cursor.isLoaded).to.eql(true);
      expect(cursor.range).to.eql('3:15'); // NB: starts at the initial loaded range.

      expect(cursor.row(0).isLoaded).to.eql(false);
      expect(cursor.row(1).isLoaded).to.eql(false);
      expect(cursor.row(2).isLoaded).to.eql(true);
      expect(cursor.row(8).isLoaded).to.eql(true);
      expect(cursor.row(14).isLoaded).to.eql(false); // NB: does not exist yet.
    });

    it('events: loading | loaded', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.cursor();

      const fired: t.TypedSheetEvent[] = [];
      sheet.events$.subscribe(e => fired.push(e));

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
      const cursor = sheet.cursor();
      const fired: t.TypedSheetEvent[] = [];
      sheet.events$.subscribe(e => fired.push(e));

      await Promise.all([cursor.load(), cursor.load(), cursor.load()]);
      expect(fired.length).to.eql(2); // NB: Would be 6 if load de-duping wan't implemented.
    });

    it('does load twice if query differs', async () => {
      const { sheet } = await testSheet();
      const cursor = sheet.cursor();
      const fired: t.TypedSheetEvent[] = [];
      sheet.events$.subscribe(e => fired.push(e));

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

  describe('cursor.row', () => {
    it('throw: row out-of-bounds (index: -1)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor().load();
      const err = /Row index must be >=0/;
      expect(() => cursor.row(-1)).to.throw(err);
    });

    it('exists', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor().load();

      expect(cursor.exists(-1)).to.eql(false);
      expect(cursor.exists(0)).to.eql(true);
      expect(cursor.exists(99)).to.eql(false);
    });

    it('retrieves non-existent row', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor().load();
      expect(cursor.exists(99)).to.eql(false);
      expect(cursor.row(99)).to.not.eql(undefined);
    });

    it('toObject', async () => {
      const { sheet } = await testSheetEnum();
      const row = (await sheet.cursor().load()).row(0);
      expect(row.toObject()).to.eql({
        single: 'hello',
        union: ['blue'],
        array: ['red', 'green', 'blue'],
      });
    });

    describe('row.types', () => {
      it('row.types.list', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor().load();
        const types = cursor.row(0).types;

        const list1 = types.list;
        const list2 = types.list;

        expect(list1).to.equal(list2); // Lazily evalutated, common instance returned.
        expect(list1.map(def => def.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
      });

      it('row.types.map', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor().load();
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
        const cursor = await sheet.cursor().load();

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

        const sheet = await TypeSystem.Sheet.load<d.MyDefaults>({ fetch, ns });
        const cursor = await sheet.cursor().load();
        expect(cursor.exists(99)).to.eql(false);
      });
    });

    describe('row.prop (read/write methods)', () => {
      it('reuse api instance', async () => {
        const { sheet } = await testSheetPrimitives();
        const row = (await sheet.cursor().load()).row(0);

        const prop1 = row.prop('numberProp');
        const prop2 = row.prop('numberProp');
        const prop3 = row.prop('stringValue');

        expect(prop1).to.equal(prop2);
        expect(prop1).to.not.equal(prop3);
      });

      it('get', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor().load();
        const prop1 = cursor.row(0).prop('stringValue');
        const prop2 = cursor.row(99).prop('stringValue');

        expect(prop1.get()).to.eql('hello value');
        expect(prop2.get()).to.eql('Hello (Default)');
      });

      it('set', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor().load();
        const prop = cursor.row(0).prop('stringValue');

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

      it.only('set: throw if attempt to set ref', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor().load();
        const row = cursor.row(0);
        expect(() => row.prop('messages').set({} as any)).to.throw(/Cannot write to property/);
        expect(() => row.prop('message').set({} as any)).to.throw(/Cannot write to property/);
      });

      it('clear', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor().load();

        const prop = cursor.row(0).prop('stringValue');
        expect(prop.get()).to.eql('hello value');

        prop.clear();
        expect(prop.get()).to.eql('Hello (Default)');
      });
    });

    describe('read/write (inline)', () => {
      it('{ object }', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor().load();
        const row = cursor.row(0);

        expect(row.props.title).to.eql('One');
        expect(row.props.color).to.eql({ label: 'background', color: 'red' });
        expect(row.props.isEnabled).to.eql(true);

        row.prop('title').set('hello');
        row.prop('color').set({ label: 'background', color: 'green', description: 'Yo' });

        expect(row.props.title).to.eql('hello');
        expect(row.props.color).to.eql({
          label: 'background',
          color: 'green',
          description: 'Yo',
        });

        row.prop('title').set('');
        row.prop('color').set(undefined);

        expect(row.props.title).to.eql('');
        expect(row.props.color).to.eql(undefined);
      });

      describe('enum', () => {
        it('single', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.single).to.eql('hello');

          row.prop('single').set(undefined);
          expect(row.props.single).to.eql(undefined);
        });

        it('union', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.union).to.eql(['blue']);

          row.prop('union').set('red');
          expect(row.props.union).to.eql('red');

          row.prop('union').set(['blue', 'blue']); // NB: stupid valid, testing array structure.
          expect(row.props.union).to.eql(['blue', 'blue']);

          row.prop('union').clear();
          expect(row.props.union).to.eql(undefined);
        });

        it('array', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.array).to.eql(['red', 'green', 'blue']);
          row.prop('array').clear();
          expect(row.props.array).to.eql([]);
        });
      });

      describe('primitive', () => {
        it('string', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);

          expect(row.props.stringValue).to.eql('hello value');
          expect(row.props.stringProp).to.eql('hello prop');
          row.prop('stringValue').set('');
          row.prop('stringProp').set('');

          expect(row.props.stringValue).to.eql('');
          expect(row.props.stringProp).to.eql('');
        });

        it('number', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.numberValue).to.eql(123);
          expect(row.props.numberProp).to.eql(456);
          row.prop('numberValue').set(-1);
          row.prop('numberProp').set(-1);
          expect(row.props.numberValue).to.eql(-1);
          expect(row.props.numberProp).to.eql(-1);
        });

        it('boolean', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.booleanValue).to.eql(true);
          expect(row.props.booleanProp).to.eql(true);
          await row.prop('booleanValue').set(false);
          await row.prop('booleanProp').set(false);
          expect(row.props.booleanValue).to.eql(false);
          expect(row.props.booleanProp).to.eql(false);
        });

        it('null', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.nullValue).to.eql(null);

          row.prop('nullValue').set(123);
          row.prop('nullProp').set(123);
          expect(row.props.nullValue).to.eql(123);
          expect(row.props.nullProp).to.eql(123);

          row.prop('nullValue').set(null);
          row.prop('nullProp').set(null);
          expect(row.props.nullValue).to.eql(null);
          expect(row.props.nullProp).to.eql(null);
        });

        it('undefined', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor().load();
          const row = cursor.row(0);
          expect(row.props.undefinedValue).to.eql(undefined);
          expect(row.props.undefinedProp).to.eql(undefined);

          row.prop('undefinedValue').set('hello');
          row.prop('undefinedProp').set('hello');
          expect(row.props.undefinedValue).to.eql('hello');
          expect(row.props.undefinedProp).to.eql('hello');

          row.prop('undefinedValue').set(undefined);
          row.prop('undefinedProp').set(undefined);

          expect(row.props.undefinedValue).to.eql(undefined);
          expect(row.props.undefinedProp).to.eql(undefined);
        });
      });
    });

    describe.only('read/write (ref)', () => {
      it('1:1 (row)', async () => {
        const { sheet } = await testSheetMessages();
        const cursor = await sheet.cursor().load();
        const row = cursor.row(0);

        const color = row.props.color;

        // const messages = await row.props.messages;
        // console.log('-------------------------------------------');
        // console.log('color', color);

        expect(color).to.be.an.instanceof(TypedSheetRef);
      });

      it('1:* (cursor)', async () => {
        const { sheet } = await testSheetMessages();
        const cursor = await sheet.cursor().load();
        const row = cursor.row(0);

        const messages = row.props.messages;
        expect(messages).to.be.an.instanceof(TypedSheetRefs);
      });
    });
  });

  describe('state', () => {
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
      it('row.hasChanges', async () => {
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

      it('row.changes - initial state {empty}', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        expect(state.changes).to.eql({});
      });

      it('row.changes: new instance on each call', async () => {
        const { sheet } = await testSheet();
        const state = sheet.state;
        const res1 = state.changes;
        const res2 = state.changes;
        expect(res1).to.eql(res2);
        expect(res1).to.not.equal(res2); // NB: Different instance.
      });

      it('row.changes: pending change returned via [fetch]', async () => {
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
      it('revert changes', async () => {
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

        state.revert();
        expect(state.hasChanges).to.eql(false);
        expect(state.changes).to.eql({});
        expect(fired.length).to.eql(1);
        expect(await state.getCell('A1')).to.eql({ value: 'One' }); // NB: retrieving original value after revert.

        const e = fired[0].payload as t.ITypedSheetReverted;
        expect(e.ns).to.eql('ns:foo.mySheet');
        expect(e.from).to.eql(changes);
        expect(e.to).to.eql({});
      });

      it('clear cache (retain other items in cache)', async () => {
        const { sheet, fetch } = await testSheet();
        const state = sheet.state;
        const cache = state.fetch.cache;

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

  describe('TypedSheetRow', () => {
    const testRow = async (uri: string) => {
      const ctx = TypedSheet.ctx({ fetch: await testFetchMySheet('ns:foo.mySheet') });
      const ns = await TypeClient.load({ ns: 'ns:foo', fetch: ctx.fetch, cache: ctx.cache });
      const columns = ns.columns;
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
      expect(row.isLoaded).to.eql(false);

      expect(row.types.list).to.eql(ns.columns);
      expect(row.types.map.title.column).to.eql('A');

      expect(row.props.title).to.eql('Untitled'); // Default value.
      expect(row.props.isEnabled).to.eql(undefined);
    });

    it('load', async () => {
      const { row } = await testRow('cell:foo:1');

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
      const { ns, ctx } = await testRow('cell:foo:1');
      const uri = 'cell:foo:1';
      const columns = ns.columns;
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

const testFetchMessages = (ns: string) => {
  return testInstanceFetch({
    instance: ns,
    implements: 'ns:foo.messages',
    defs: TYPE_DEFS,
    rows: [],
    cells: {},
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

const testSheetMessages = async () => {
  const ns = 'ns:foo.myMessages';
  const fetch = await testFetchMessages(ns);
  const sheet = await TypeSystem.Sheet.load<m.MyMessages>({ fetch, ns });
  return { ns, fetch, sheet };
};
