import { Subject } from 'rxjs';

import { TypeSystem } from '../..';
import { time, expect, testInstanceFetch, TYPE_DEFS, t } from '../../test';
import { ChangeMonitor } from '.';
import * as m from '../../test/.d.ts/all';

describe('TypedSheetChangeMonitor', () => {
  describe('lifecycle', () => {
    it('dispose', () => {
      const monitor = ChangeMonitor.create();
      expect(monitor.isDisposed).to.eql(false);

      let count = 0;
      monitor.dispose$.subscribe(() => count++);

      monitor.dispose();
      monitor.dispose();
      monitor.dispose();

      expect(monitor.isDisposed).to.eql(true);
      expect(count).to.eql(1);
    });
  });

  describe('watch/unwatch', () => {
    it('isWatching', async () => {
      const sheet1 = (await testMySheet()).sheet;
      const sheet2 = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create();

      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(false);

      monitor.watch(sheet1);

      expect(monitor.isWatching(sheet1)).to.eql(true);
      expect(monitor.isWatching(sheet2)).to.eql(false);
      expect(monitor.isWatching(undefined as any)).to.eql(false);

      monitor.watch(sheet2);
      expect(monitor.isWatching(sheet1)).to.eql(true);
      expect(monitor.isWatching(sheet2)).to.eql(true);
    });

    it('watch', async () => {
      const { sheet } = await testMySheet();
      const monitor = ChangeMonitor.create();

      expect(monitor.isWatching(sheet)).to.eql(false);
      expect(monitor.watching).to.eql([]);

      monitor.watch(sheet);
      expect(monitor.isWatching(sheet)).to.eql(true);
      expect(monitor.watching.map(sheet => sheet.uri.toString())).to.eql([sheet.uri.toString()]);

      monitor.watch(sheet);
      monitor.watch(sheet);
      monitor.watch(sheet);
      expect(monitor.watching.map(sheet => sheet.uri.toString())).to.eql([sheet.uri.toString()]);
    });

    it('unwatch', async () => {
      const sheet1 = (await testMySheet()).sheet;
      const sheet2 = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create();

      monitor.watch(sheet1).watch(sheet2);

      expect(monitor.isWatching(sheet1)).to.eql(true);
      expect(monitor.isWatching(sheet2)).to.eql(true);

      monitor.unwatch(sheet1);
      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(true);

      monitor.unwatch(sheet2);
      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(false);

      monitor.unwatch(sheet1).unwatch(sheet2); // NB: test chaining (on empty)
      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(false);
    });

    it('watch/unwatch/isWatching (array)', async () => {
      const sheet1 = (await testMySheet()).sheet;
      const sheet2 = (await testMySheet()).sheet;
      const sheet3 = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create();

      monitor.watch([sheet1, sheet2, sheet3]);

      expect(monitor.isWatching([sheet1, sheet2])).to.eql(true);
      expect(monitor.isWatching([sheet1, sheet3, sheet2])).to.eql(true);

      monitor.unwatch(sheet2);
      expect(monitor.isWatching([sheet1, sheet2])).to.eql(false);
      expect(monitor.isWatching([sheet1, sheet3])).to.eql(true);

      monitor.unwatch([sheet2, sheet3, sheet1]);
      expect(monitor.isWatching([sheet1, sheet2, sheet3])).to.eql(false);
      expect(monitor.isWatching([])).to.eql(false);
      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(false);
      expect(monitor.isWatching(sheet3)).to.eql(false);
    });

    it('unwatches on sheet disposed', async () => {
      const sheet1 = (await testMySheet()).sheet;
      const sheet2 = (await testMySheet()).sheet;

      const monitor = ChangeMonitor.create().watch([sheet1, sheet2]);
      expect(monitor.isWatching(sheet1)).to.eql(true);
      expect(monitor.isWatching(sheet2)).to.eql(true);

      sheet1.dispose();

      expect(monitor.isWatching(sheet1)).to.eql(false);
      expect(monitor.isWatching(sheet2)).to.eql(true);
    });
  });

  describe('bubbles events (observable)', () => {
    it('event$', async () => {
      const sheet1 = (await testMySheet()).sheet;
      const sheet2 = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create()
        .watch(sheet1)
        .watch(sheet2);

      const fired: t.TypedSheetEvent[] = [];
      monitor.event$.subscribe(e => fired.push(e));

      const rowA = sheet1.data<m.MyRow>('MyRow').row(0).props;
      const rowB = sheet2.data<m.MyRow>('MyRow').row(0).props;

      expect(fired).to.eql([]);
      rowA.title = 'Hello';
      rowA.title = 'Hello';
      expect(fired.length).to.eql(1);
      expect(fired[0].type).to.eql('SHEET/change');

      rowA.title = 'Goodbye';
      expect(fired.length).to.eql(2);

      monitor.unwatch(sheet1);

      rowA.title = 'Foobar';
      expect(fired.length).to.eql(2); // NB: No longer firing change event for sheet-1.

      rowB.title = 'Boom';
      expect(fired.length).to.eql(3); // NB: Still firing for the sheet-2.

      monitor.dispose();
      rowB.title = 'Bar';
      expect(fired.length).to.eql(3);
    });

    it('changed$', async () => {
      const sheet = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create().watch(sheet);

      const fired: t.ITypedSheetChanged[] = [];
      monitor.changed$.subscribe(e => fired.push(e));

      const row = sheet.data<m.MyRow>('MyRow').row(0).props;
      row.title = 'Foo';

      await time.wait(0);

      expect(fired.length).to.eql(1);
      expect(fired[0].sheet).to.equal(sheet);
      expect(fired[0].change.to).to.eql({ value: 'Foo' });
    });

    it('changed$ (from ➔ to: strips "hash")', async () => {
      const { sheet, fetch } = await testMySheet({ A1: { value: 'MyTitle', hash: 'abc' } });
      const monitor = ChangeMonitor.create().watch(sheet);

      const fired: t.ITypedSheetChanged[] = [];
      monitor.changed$.subscribe(e => fired.push(e));

      const cursor = await sheet.data<m.MyRow>('MyRow').load();
      const row = cursor.row(0).props;
      const res = await fetch.getCells({ ns: 'ns:foo.mySheet', query: 'A1:A1' });

      // NB: Injected test values.
      expect(row.title).to.eql('MyTitle');
      expect(res.cells?.A1?.hash).to.eql('abc'); // NB: Hash exists on underlying data.

      row.title = 'Foobar';
      await time.wait(0);

      const changes = sheet.state.changes;
      expect(changes).to.eql(fired[0].changes);

      const A1 = sheet.state.changes.cells?.A1 as t.ITypedSheetChangeCellDiff;
      expect(A1.from.value).to.eql('MyTitle');
      expect(A1.to.value).to.eql('Foobar');

      // NB: hashes stripped!
      expect(A1.from.hash).to.eql(undefined);
      expect(A1.to.hash).to.eql(undefined);
    });
  });

  describe('REF (auto monitor child sheets)', () => {
    const testRef = async () => {
      const sheet = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create().watch(sheet);
      const row = sheet.data<m.MyRow>('MyRow').row(0);
      const messages = row.props.messages;
      return { sheet, monitor, row, messages };
    };

    it('auto-watches child REF on load', async () => {
      const { monitor, messages, sheet } = await testRef();
      expect(monitor.watching.map(sheet => sheet.uri.toString())).to.eql([sheet.uri.toString()]);
      await messages.load();
      expect(monitor.isWatching(messages.sheet)).to.eql(true);
    });

    it('auto-unwatches child REF on unwatch of parent sheet', async () => {
      const { monitor, messages, sheet } = await testRef();
      await messages.load();
      expect(monitor.isWatching(sheet)).to.eql(true);
      expect(monitor.isWatching(messages.sheet)).to.eql(true);

      monitor.unwatch(sheet);
      expect(monitor.isWatching(sheet)).to.eql(false);
      expect(monitor.isWatching(messages.sheet)).to.eql(false);
    });

    it('auto-unwatches child REF on dispose of parent sheet', async () => {
      const { monitor, messages, sheet } = await testRef();
      await messages.load();
      expect(monitor.isWatching(sheet)).to.eql(true);
      expect(monitor.isWatching(messages.sheet)).to.eql(true);

      sheet.dispose();
      expect(monitor.isWatching(sheet)).to.eql(false);
      expect(monitor.isWatching(messages.sheet)).to.eql(false);
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
