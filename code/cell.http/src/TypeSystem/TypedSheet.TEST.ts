import { TypeSystem } from '../TypeSystem';
import { testInstanceFetch } from '../TypeSystem/test';
import * as g from './.d.ts/MyRow';
import { expect, TYPE_DEFS, ERROR } from './test';

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

  it.skip('query (paging: index/skip)', () => {}); // tslint:disable-line

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
      expect(sheet.errors[0].type).to.eql(ERROR.TYPE.DEF_NOT_FOUND);
    });
  });

  describe('cursor', () => {
    it('inline: read (strongly typed prop)', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testInstanceFetch({
        instance: ns,
        implements: 'ns:foo',
        defs: TYPE_DEFS,
        rows: [
          { title: 'One', isEnabled: true, color: { label: 'background', color: 'red' } },
          { title: 'Two', isEnabled: false, color: { label: 'foreground', color: 'blue' } },
        ],
      });

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

    it('inline: write (strongly typed prop)', async () => {
      const ns = 'ns:foo.mySheet';
      const fetch = await testInstanceFetch({
        instance: ns,
        implements: 'ns:foo',
        defs: TYPE_DEFS,
        rows: [],
      });

      const sheet = await TypeSystem.Sheet.load<g.MyRow>({ fetch, ns });
      const cursor = await sheet.cursor();

      console.log('TODO');
    });
  });
});
