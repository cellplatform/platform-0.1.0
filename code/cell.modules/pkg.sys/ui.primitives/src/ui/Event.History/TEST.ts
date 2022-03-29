import { Subject } from 'rxjs';
import { expect, Test } from 'sys.ui.dev';

import { EventHistoryMonitor } from '.';
import { rx, t } from '../common';

export default Test.describe('EventHistoryMonitor', (e) => {
  e.it('has bus', () => {
    const bus = rx.bus();
    const monitor = EventHistoryMonitor(bus);
    expect(monitor.bus).to.eql(rx.bus.instance(bus));
  });

  e.it('no bus (undefined)', () => {
    const monitor = EventHistoryMonitor(undefined);
    expect(monitor.bus).to.eql('');
  });

  e.it('adds an event fired from the bus', () => {
    const bus = rx.bus();
    const monitor = EventHistoryMonitor(bus);

    expect(monitor.total).to.eql(0);
    expect(monitor.events).to.eql([]);

    const event: t.Event = { type: 'FOO', payload: {} };
    bus.fire(event);

    expect(monitor.total).to.eql(1);

    const events = monitor.events;
    expect(events[0].id.startsWith('event.')).to.eql(true);
    expect(events[0].event).to.eql(event);
    expect(events[0].count).to.eql(1);
  });

  e.it('stops on dispose', () => {
    const bus = rx.bus();
    const monitor = EventHistoryMonitor(bus);

    bus.fire({ type: 'FOO', payload: {} });
    expect(monitor.total).to.eql(1);

    let count = 0;
    monitor.dispose$.subscribe(() => count++);
    monitor.dispose();
    monitor.dispose();
    monitor.dispose();
    expect(count).to.eql(1);

    bus.fire({ type: 'FOO', payload: {} });
    bus.fire({ type: 'FOO', payload: {} });
    bus.fire({ type: 'FOO', payload: {} });
    expect(monitor.total).to.eql(1); // NB: no change.
  });

  e.it('changed$', () => {
    const bus = rx.bus();
    const monitor = EventHistoryMonitor(bus);

    expect(monitor.total).to.eql(0);
    expect(monitor.events).to.eql([]);

    let fired: t.EventHistoryItem[] = [];
    monitor.changed$.subscribe((e) => (fired = e));

    bus.fire({ type: 'FOO', payload: { msg: 'item-1' } });
    expect(fired.length).to.eql(1);
    expect(fired[0].event.payload.msg).to.eql('item-1');

    bus.fire({ type: 'FOO', payload: { msg: 'item-2' } });
    expect(fired.length).to.eql(2);
    expect(fired[0].event.payload.msg).to.eql('item-1');
    expect(fired[1].event.payload.msg).to.eql('item-2');

    monitor.dispose();
    bus.fire({ type: 'FOO', payload: {} });
    bus.fire({ type: 'FOO', payload: {} });

    expect(fired.length).to.eql(2);
  });

  e.it('reset (via observable)', () => {
    const reset$ = new Subject<void>();
    const bus = rx.bus();
    const monitor = EventHistoryMonitor(bus, { reset$ });

    bus.fire({ type: 'FOO', payload: {} });
    bus.fire({ type: 'FOO', payload: {} });

    expect(monitor.total).to.eql(2);

    let count = 0;
    monitor.changed$.subscribe(() => count++);
    reset$.next();

    expect(monitor.total).to.eql(0);
    expect(count).to.eql(1);
  });

  e.describe('enabled', (e) => {
    e.it('enabled by default', () => {
      const bus = rx.bus();
      expect(EventHistoryMonitor(bus).enabled).to.eql(true);
    });

    e.it('disabled (boolean)', () => {
      const bus = rx.bus();
      const monitor = EventHistoryMonitor(bus, { enabled: false });
      expect(monitor.enabled).to.eql(false);

      bus.fire({ type: 'FOO', payload: {} });
      expect(monitor.total).to.eql(0);
    });

    e.it('disabled (via function)', () => {
      const bus = rx.bus();
      const monitor = EventHistoryMonitor(bus, { enabled: () => false });
      expect(monitor.enabled).to.eql(false);

      bus.fire({ type: 'FOO', payload: {} });
      expect(monitor.total).to.eql(0);
    });
  });
});
