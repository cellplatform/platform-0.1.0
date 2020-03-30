import * as f from '../../test/.d.ts/foo';
import * as p from '../../test/.d.ts/foo.primitives';
import * as e from '../../test/.d.ts/foo.enum';
import * as d from '../../test/.d.ts/foo.defaults';

import { ERROR, expect, testInstanceFetch, TYPE_DEFS, testFetch } from '../../test';
import { TypeSystem } from '..';

/**
 * TODO 🐷TESTS
 * - ref: not NS URI
 * - ref: not found (404)
 * - n-level deep type refs.
 * - circular ref safe on referenced type
 * - different types
 */

/**
 * TODO 🐷 Features
 * - error check typename on NS upon writing (Captialised, no spaces)
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - change handler (pending => save)
 * - read/write: linked sheet
 */

describe('TypedSheet', () => {
  it.skip('read/write primitive types', () => {}); // tslint:disable-line
  it.skip('read/write ref (singular) - linked sheet', () => {}); // tslint:disable-line
  it.skip('read/write ref (array/list) - linked sheet', () => {}); // tslint:disable-line

  it.skip('events$ - observable (change/pending-save alerts)', () => {}); // tslint:disable-line
  it.skip('events$ - read/write deeply into child props (fires change events)', () => {}); // tslint:disable-line

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

  describe('cursor/row', () => {
    const testFetchMySheet = (ns: string) => {
      return testInstanceFetch({
        instance: ns,
        implements: 'ns:foo',
        defs: TYPE_DEFS,
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
      const fetch = await testFetchMySheet(ns);
      const sheet = await TypeSystem.Sheet.load<f.MyRow>({ fetch, ns });
      return { ns, fetch, sheet };
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

    it('throw: row out-of-bounds (index: -1)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();
      const err = /Row index must be >=0/;
      expect(() => cursor.row(-1)).to.throw(err);
    });

    it('exists', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();

      expect(cursor.exists(-1)).to.eql(false);
      expect(cursor.exists(0)).to.eql(true);
      expect(cursor.exists(99)).to.eql(false);
    });

    it('retrieves non-existent row', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();
      expect(cursor.exists(99)).to.eql(false);
      expect(cursor.row(99)).to.not.eql(undefined);
    });

    describe('row.types', () => {
      it('row.types.list', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor();
        const types = cursor.row(0).types;

        const list1 = types.list;
        const list2 = types.list;

        expect(list1).to.equal(list2); // Lazily evalutated, common instance returned.
        expect(list1.map(def => def.column)).to.eql(['A', 'B', 'C', 'D', 'E']);
      });

      it('row.types.map', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor();
        const types = cursor.row(0).types;

        expect(types.map.title.column).to.eql('A');
        expect(types.map.isEnabled.column).to.eql('B');
        expect(types.map.color.column).to.eql('C');
        expect(types.map.message.column).to.eql('D');
        expect(types.map.messages.column).to.eql('E');
      });
    });

    describe('read: default value', () => {
      it('simple', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor();

        const row1 = cursor.row(0).props; //  NB: Exists
        const row2 = cursor.row(99).props; // NB: Does not exist.

        expect(row1.stringValue).to.eql('hello value');
        expect(row2.stringValue).to.eql('hello-default');
      });

      it('ref (look up at cell address)', async () => {
        const ns = 'ns:foo.sample';
        const fetch = await testInstanceFetch({
          instance: ns,
          implements: 'ns:foo.defaults',
          defs: TYPE_DEFS,
          rows: [],
          cells: {
            A1: { value: 'my-foo-default' },
          },
        });

        const sheet = await TypeSystem.Sheet.load<d.MyDefaults>({ fetch, ns });
        const cursor = await sheet.cursor();
        expect(cursor.exists(99)).to.eql(false);
      });
    });

    describe('read/write prop (inline)', () => {
      it('{ object }', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor();
        const row = cursor.row(0);

        expect(row.props.title).to.eql('One');
        expect(row.props.color).to.eql({ label: 'background', color: 'red' });
        expect(row.props.message).to.eql(undefined);
        expect(row.props.isEnabled).to.eql(true);

        row.props.title = 'hello';
        row.props.color = { label: 'background', color: 'green', description: 'Yo' };
        expect(row.props.title).to.eql('hello');
        expect(row.props.color).to.eql({ label: 'background', color: 'green', description: 'Yo' });

        row.props.title = '';
        row.props.color = undefined;

        expect(row.props.title).to.eql('');
        expect(row.props.color).to.eql(undefined);
      });

      describe('enum', () => {
        it('single', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0).props;
          expect(row.single).to.eql('hello');
          row.single = undefined;
          expect(row.single).to.eql(undefined);
        });

        it('union', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0).props;
          expect(row.union).to.eql(['blue']);

          row.union = 'red';
          expect(row.union).to.eql('red');

          row.union = ['blue', 'blue']; // NB: stupid valid, testing array structure.
          expect(row.union).to.eql(['blue', 'blue']);

          row.union = undefined as any;
          expect(row.union).to.eql(undefined);
        });

        it('array', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0).props;
          expect(row.array).to.eql(['red', 'green', 'blue']);
          row.array = undefined as any;
          expect(row.array).to.eql(undefined);
        });
      });

      describe('primitive', () => {
        it('string', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0).props;
          expect(row.stringValue).to.eql('hello value');
          expect(row.stringProp).to.eql('hello prop');
          row.stringValue = '';
          row.stringProp = '';
          expect(row.stringValue).to.eql('');
          expect(row.stringProp).to.eql('');
        });

        it('number', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
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
          const cursor = await sheet.cursor();
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
          const cursor = await sheet.cursor();
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
          const cursor = await sheet.cursor();
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

    describe('read/write prop (ref)', () => {
      it.skip('read prop: ref', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor();

        const row = cursor.row(0);

        // console.log('row.props.title', row.props.title);
        // console.log('row.props.message', row.props.message);
        // console.log('-------------------------------------------');
        // console.log('row', row);
      });
    });

    it.skip('dot into child object (synthetic read/write props)', () => {}); // tslint:disable-line

    it.skip('query (paging: index/skip)', () => {}); // tslint:disable-line
  });
});
