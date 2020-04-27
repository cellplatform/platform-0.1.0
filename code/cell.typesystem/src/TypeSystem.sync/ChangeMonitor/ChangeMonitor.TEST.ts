import { Subject } from 'rxjs';

import { TypeSystem } from '../..';
import { expect, testInstanceFetch, TYPE_DEFS, t } from '../../test';
import { ChangeMonitor } from '.';
import * as m from '../../test/.d.ts/all';

describe.skip('ChangeMonitor', () => {
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
      expect(monitor.watching).to.eql([sheet.uri.toString()]);

      monitor.watch(sheet);
      monitor.watch(sheet);
      monitor.watch(sheet);
      expect(monitor.watching).to.eql([sheet.uri.toString()]);
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

    it('bubbles events', async () => {
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
  });

  describe('ref (auto monitor child sheets)', () => {
    it('attaches to child ref sheet', async () => {
      const sheet = (await testMySheet()).sheet;
      const monitor = ChangeMonitor.create().watch(sheet);

      const row = sheet.data<m.MyRow>('MyRow').row(0);
      const messages = await row.props.messages.load();

      console.log('messages.isLoaded', messages.isLoaded);
      console.log('-------------------------------------------');

      const f = monitor.isWatching(messages.sheet);
      console.log('f', f);
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
  });
};

const testMySheet = async () => {
  const ns = 'ns:foo.mySheet';
  const event$ = new Subject<t.TypedSheetEvent>();
  const fetch = await testFetchMySheet(ns);
  const sheet = await TypeSystem.Sheet.load<m.MyRow>({ fetch, ns, event$ });
  return { ns, fetch, sheet, event$ };
};
