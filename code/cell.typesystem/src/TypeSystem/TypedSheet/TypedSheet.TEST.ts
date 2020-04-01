import * as f from '../../test/.d.ts/foo';
import * as p from '../../test/.d.ts/foo.primitives';
import * as e from '../../test/.d.ts/foo.enum';
import * as d from '../../test/.d.ts/foo.defaults';
import * as m from '../../test/.d.ts/foo.messages';

import { ERROR, expect, testInstanceFetch, TYPE_DEFS, t } from '../../test';
import { TypeSystem } from '..';
import { TypedSheetRef } from './TypedSheetRef';
import { TypedSheetRefs } from './TypedSheetRefs';

/**
 * TODO 🐷 Features
 * - error check typename on NS upon writing (Captialised, no spaces)
 * - ns (read): query on subset of rows (index/take)
 * - ns (read): query string {ns:false} - omit ns data.
 * - change handler (pending => save)
 * - read/write: linked sheet
 */

describe.only('TypedSheet', () => {
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

  describe('cursor.row', () => {
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

    it('toObject', async () => {
      const { sheet } = await testSheetEnum();
      const row = (await sheet.cursor()).row(0);
      const res = await row.toObject();
      expect(res).to.eql({
        single: 'hello',
        union: ['blue'],
        array: ['red', 'green', 'blue'],
      });
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

    describe('default value', () => {
      it('simple: primitive | {object}', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor();

        const row1 = cursor.row(0).props; //  NB: Exists.
        const row2 = cursor.row(99).props; // NB: Does not exist (use default).

        expect(await row1.stringValue).to.eql('hello value');
        expect(await row2.stringValue).to.eql('Hello (Default)');
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
        const cursor = await sheet.cursor();
        expect(cursor.exists(99)).to.eql(false);
      });

      it('array (empty array when no default)', async () => {
        const { sheet } = await testSheetMessages();
        const cursor = await sheet.cursor();
        const row = cursor.row(99);
        expect(await row.props.messages).to.eql([]); // Empty array.
      });
    });

    describe('row.prop (read/write methods)', () => {
      it('reuse api instance', async () => {
        const { sheet } = await testSheetPrimitives();
        const row = (await sheet.cursor()).row(0);

        const prop1 = row.prop('numberProp');
        const prop2 = row.prop('numberProp');
        const prop3 = row.prop('stringValue');

        expect(prop1).to.equal(prop2);
        expect(prop1).to.not.equal(prop3);
      });

      it('get', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor();
        const prop1 = cursor.row(0).prop('stringValue');
        const prop2 = cursor.row(99).prop('stringValue');

        expect(await prop1.get()).to.eql('hello value');
        expect(await prop2.get()).to.eql('Hello (Default)');
      });

      it('set', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor();
        const prop = cursor.row(0).prop('stringValue');

        await prop.set('');
        expect(await prop.get()).to.eql('');

        await prop.set(' ');
        expect(await prop.get()).to.eql(' ');

        await prop.set('foo');
        expect(await prop.get()).to.eql('foo');
      });

      it('clear', async () => {
        const { sheet } = await testSheetPrimitives();
        const cursor = await sheet.cursor();

        const prop = cursor.row(0).prop('stringValue');
        expect(await prop.get()).to.eql('hello value');

        await prop.clear();
        expect(await prop.get()).to.eql('Hello (Default)');
      });
    });

    describe('read/write (inline)', () => {
      it('{ object }', async () => {
        const { sheet } = await testSheet();
        const cursor = await sheet.cursor();
        const row = cursor.row(0);

        expect(await row.props.title).to.eql('One');
        expect(await row.props.color).to.eql({ label: 'background', color: 'red' });
        expect(await row.props.message).to.eql(undefined);
        expect(await row.props.isEnabled).to.eql(true);

        await row.prop('title').set('hello');
        await row.prop('color').set({ label: 'background', color: 'green', description: 'Yo' });

        expect(await row.props.title).to.eql('hello');
        expect(await row.props.color).to.eql({
          label: 'background',
          color: 'green',
          description: 'Yo',
        });

        await row.prop('title').set('');
        await row.prop('color').set(undefined);

        expect(await row.props.title).to.eql('');
        expect(await row.props.color).to.eql(undefined);
      });

      describe('enum', () => {
        it('single', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.single).to.eql('hello');

          await row.prop('single').set(undefined);
          expect(await row.props.single).to.eql(undefined);
        });

        it('union', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.union).to.eql(['blue']);

          await row.prop('union').set('red');
          expect(await row.props.union).to.eql('red');

          await row.prop('union').set(['blue', 'blue']); // NB: stupid valid, testing array structure.
          expect(await row.props.union).to.eql(['blue', 'blue']);

          await row.prop('union').clear();
          expect(await row.props.union).to.eql(undefined);
        });

        it('array', async () => {
          const { sheet } = await testSheetEnum();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.array).to.eql(['red', 'green', 'blue']);
          await row.prop('array').clear();
          expect(await row.props.array).to.eql([]);
        });
      });

      describe('primitive', () => {
        it('string', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);

          expect(await row.props.stringValue).to.eql('hello value');
          expect(await row.props.stringProp).to.eql('hello prop');
          await row.prop('stringValue').set('');
          await row.prop('stringProp').set('');

          expect(await row.props.stringValue).to.eql('');
          expect(await row.props.stringProp).to.eql('');
        });

        it('number', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.numberValue).to.eql(123);
          expect(await row.props.numberProp).to.eql(456);
          await row.prop('numberValue').set(-1);
          await row.prop('numberProp').set(-1);
          expect(await row.props.numberValue).to.eql(-1);
          expect(await row.props.numberProp).to.eql(-1);
        });

        it('boolean', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.booleanValue).to.eql(true);
          expect(await row.props.booleanProp).to.eql(true);
          await row.prop('booleanValue').set(false);
          await row.prop('booleanProp').set(false);
          expect(await row.props.booleanValue).to.eql(false);
          expect(await row.props.booleanProp).to.eql(false);
        });

        it('null', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.nullValue).to.eql(null);

          await row.prop('nullValue').set(123);
          await row.prop('nullProp').set(123);
          expect(await row.props.nullValue).to.eql(123);
          expect(await row.props.nullProp).to.eql(123);

          await row.prop('nullValue').set(null);
          await row.prop('nullProp').set(null);
          expect(await row.props.nullValue).to.eql(null);
          expect(await row.props.nullProp).to.eql(null);
        });

        it('undefined', async () => {
          const { sheet } = await testSheetPrimitives();
          const cursor = await sheet.cursor();
          const row = cursor.row(0);
          expect(await row.props.undefinedValue).to.eql(undefined);
          expect(await row.props.undefinedProp).to.eql(undefined);

          await row.prop('undefinedValue').set('hello');
          await row.prop('undefinedProp').set('hello');
          expect(await row.props.undefinedValue).to.eql('hello');
          expect(await row.props.undefinedProp).to.eql('hello');

          await row.prop('undefinedValue').set(undefined);
          await row.prop('undefinedProp').set(undefined);

          expect(await row.props.undefinedValue).to.eql(undefined);
          expect(await row.props.undefinedProp).to.eql(undefined);
        });
      });
    });

    describe.only('read/write (ref)', () => {
      it('1:1 (row)', async () => {
        const { sheet } = await testSheetMessages();
        const cursor = await sheet.cursor();
        const row = cursor.row(0);

        const color = await row.props.color;
        // const messages = await row.props.messages;

        // console.log('-------------------------------------------');
        // console.log('color', color);

        expect(color).to.be.an.instanceof(TypedSheetRef);
      });

      it('1:* (cursor)', async () => {
        const { sheet } = await testSheetMessages();
        const cursor = await sheet.cursor();
        const row = cursor.row(0);

        const messages = await row.props.messages;
        expect(messages).to.be.an.instanceof(TypedSheetRefs);
      });
    });

    it.skip('dot into child object (synthetic read/write props)', () => {}); // tslint:disable-line

    it.skip('query (paging: index/skip)', () => {}); // tslint:disable-line
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

const testSheetMessages = async () => {
  const ns = 'ns:foo.myMessages';
  const fetch = await testFetchMessages(ns);
  const sheet = await TypeSystem.Sheet.load<m.MyMessages>({ fetch, ns });
  return { ns, fetch, sheet };
};
