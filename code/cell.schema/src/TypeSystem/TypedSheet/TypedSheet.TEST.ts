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

  it.skip('write to non-existent row (new row auto-generated)', () => {}); // tslint:disable-line
  it.skip('', () => {}); // tslint:disable-line

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
          { title: 'One', isEnabled: true, color: { label: 'background', color: 'red' } },
          { title: 'Two', isEnabled: false, color: { label: 'foreground', color: 'blue' } },
        ],
      });
    };

    it('inline: read (prop)', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testCursorFetch();
      const sheet = await TypeSystem.Sheet.load<g.MyRow>({ fetch, ns });
      const cursor = await sheet.cursor();

      const row1 = cursor.row(0);
      const row2 = cursor.row(1);
      const row3 = cursor.row(2);

      expect(row1).to.not.eql(undefined);
      expect(row2).to.not.eql(undefined);
      expect(row3).to.eql(undefined);

      if (row1) {
        expect(row1.title).to.eql('One');
        expect(row1.isEnabled).to.eql(true);
        expect(row1.color).to.eql({ label: 'background', color: 'red' });
      }

      if (row2) {
        expect(row2.title).to.eql('Two');
        expect(row2.isEnabled).to.eql(false);
        expect(row2.color).to.eql({ label: 'foreground', color: 'blue' });
      }
    });

    it.only('inline: write (prop)', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testCursorFetch();
      const sheet = await TypeSystem.Sheet.load<g.MyRow>({ fetch, ns });
      const cursor = await sheet.cursor();

      const row1 = cursor.row(0);
      const row9 = cursor.row(8);

      if (row1) {
        expect(row1.title).to.eql('One');
        expect(row1.color).to.eql({ label: 'background', color: 'red' });
        expect(row1.msg).to.eql(undefined);

        row1.title = 'hello';
        row1.color = { label: 'background', color: 'green', description: 'Yo' };
        expect(row1.title).to.eql('hello');
        expect(row1.color).to.eql({ label: 'background', color: 'green', description: 'Yo' });

        row1.title = '';
        row1.color = undefined;
        row1.msg = null;

        expect(row1.title).to.eql('');
        expect(row1.color).to.eql(undefined);
        expect(row1.msg).to.eql(null);
      }

      if (row9) {
        /**
         * TODO 🐷
         * - write to row that does not yet exist!
         */

        row9.title = 'foo';
      }
    });

    it.skip('query (paging: index/skip)', () => {}); // tslint:disable-line
  });
});
