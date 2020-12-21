import { expect, is, rx, t } from '../test';
import { CodeEditorEvents } from './CodeEditorEvents';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();

describe('CodeEditorEvents', () => {
  it('create: from bus', () => {
    const events = CodeEditorEvents.create(bus);
    expect(is.observable(events.$)).to.eql(true);

    let count = 0;
    events.$.subscribe(() => count++);
    bus.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'foo', isFocused: true },
    });

    expect(count).to.eql(1);
  });

  it('$: only CodeEditor events', () => {
    const bus = rx.bus();
    const events = CodeEditorEvents.create(bus);

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

    bus.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'foo', isFocused: true },
    });
    expect(count).to.eql(1);
  });

  it('fire: any instance', () => {
    const bus = rx.bus();
    const events = CodeEditorEvents.create(bus);

    let busCount = 0;
    let eventCount = 0;
    bus.event$.subscribe(() => busCount++);
    events.$.subscribe(() => eventCount++);

    events.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'foo', isFocused: true },
    });
    events.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'bar', isFocused: true },
    });

    expect(busCount).to.eql(2);
    expect(eventCount).to.eql(2);
  });

  it('fire: specific instance', () => {
    const bus = rx.bus();
    const events = CodeEditorEvents.create(bus, { instance: 'foo' });

    let busCount = 0;
    let eventCount = 0;
    bus.event$.subscribe(() => busCount++);
    events.$.subscribe(() => eventCount++);

    events.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'foo', isFocused: true },
    });
    events.fire({
      type: 'CodeEditor/focus',
      payload: { instance: 'bar', isFocused: true },
    });

    expect(busCount).to.eql(2);
    expect(eventCount).to.eql(1);
  });
});
