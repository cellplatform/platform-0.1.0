import { expect, is, rx, t } from '../../test';
import { InstanceEvents } from './Instance.Events';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();
const id = 'foo';

describe('Events: Instance', () => {
  it('create', () => {
    const events = InstanceEvents.create(bus, id);
    expect(is.observable(events.$)).to.eql(true);

    let count = 0;
    events.$.subscribe(() => count++);
    bus.fire({
      type: 'CodeEditor/change:focus',
      payload: { instance: 'foo' },
    });

    expect(count).to.eql(1);
  });

  it('only "CodeEditor/" instance events (filter generic bus)', () => {
    const bus = rx.bus();
    const events = InstanceEvents.create(bus, id);

    let count = 0;
    events.$.subscribe(() => count++);

    const notFired = (e: any) => {
      bus.fire(e);
      expect(count).to.eql(0);
    };
    notFired(undefined);
    notFired(123);
    notFired({});
    notFired({ type: 'foo' });
    notFired({ type: 'foo', payload: {} });
    notFired({ type: 'CodeEditor/foo', payload: {} }); // NB: Global code-editor event.

    bus.fire({
      type: 'CodeEditor/change:focus',
      payload: { instance: 'foo' },
    });
    expect(count).to.eql(1);
  });

  it('fire: specific instance', () => {
    const bus = rx.bus();
    const events = InstanceEvents.create(bus, id);

    let busCount = 0;
    let eventCount = 0;
    bus.event$.subscribe(() => busCount++);
    events.$.subscribe(() => eventCount++);

    events.fire('foo').focus();
    events.fire('bar').focus();

    expect(busCount).to.eql(2);
    expect(eventCount).to.eql(1);
  });
});
