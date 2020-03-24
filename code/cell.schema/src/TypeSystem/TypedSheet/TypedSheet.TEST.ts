import * as g from '../test/.d.ts/MyRow';
import { ERROR, expect, testInstanceFetch, TYPE_DEFS } from '../test';
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
 * - different scalar types
 * - handle enums (?)
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
      const sheet = await TypeSystem.Sheet.load<g.MyRow>({ fetch, ns });

      expect(sheet.ok).to.eql(false);
      expect(sheet.errors[0].message).to.include(`The namespace "ns:foo.notExist" does not exist`);
      expect(sheet.errors[0].type).to.eql(ERROR.TYPE.NOT_FOUND);
    });
  });

  describe('cursor', () => {
    const testCursorFetch = () => {
      const ns = 'ns:foo.mySheet';
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

    const testSheet = async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testCursorFetch();
      const sheet = await TypeSystem.Sheet.load<g.MyRow>({ fetch, ns });
      return { ns, fetch, sheet };
    };

    it('throw: row out-of-bounds (-1)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();
      const err = /Row index must be >=0/;
      expect(() => cursor.row(-1)).to.throw(err);
      expect(() => cursor.props(-1)).to.throw(err);
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

    it.skip('read prop: default value', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();

      const row = cursor.row(99);
      expect(row.props.title).to.not.eql(undefined); // Should get default value.
    });

    it('read prop: inline', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();

      const row1 = cursor.row(0);
      const row2 = cursor.row(1);

      expect(row1).to.not.eql(undefined);
      expect(row2).to.not.eql(undefined);

      expect(row1.props.title).to.eql('One');
      expect(row1.props.isEnabled).to.eql(true);
      expect(row1.props.color).to.eql({ label: 'background', color: 'red' });

      expect(row2.props.title).to.eql('Two');
      expect(row2.props.isEnabled).to.eql(false);
      expect(row2.props.color).to.eql({ label: 'foreground', color: 'blue' });
    });

    it.skip('read prop: ref', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();

      const row = cursor.row(0);

      console.log('row.props.title', row.props.title);
      console.log('row.props.message', row.props.message);
      console.log('-------------------------------------------');
      // console.log('row', row);
    });

    it('write prop: inline (scalar | object)', async () => {
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

    it.skip('write prop: inline (null)', async () => {
      const { sheet } = await testSheet();
      const cursor = await sheet.cursor();
      const row = cursor.row(0);

      expect(row.props.isEnabled).to.eql(true);

      row.props.isEnabled = false;
      expect(row.props.isEnabled).to.eql(false);

      row.props.isEnabled = null;
      expect(row.props.isEnabled).to.eql(null);

      // expect(row.props.message).to.eql(null);
    });

    it.skip('dot into child object (synthetic read/write props)', () => {}); // tslint:disable-line

    it.skip('query (paging: index/skip)', () => {}); // tslint:disable-line
  });
});
