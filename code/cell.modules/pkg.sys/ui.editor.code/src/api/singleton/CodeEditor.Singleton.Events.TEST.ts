import { expect, is, rx, t } from '../../test';
import { CodeEditorSingletonEvents } from './CodeEditor.Singleton.Events';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();

describe('CodeEditorSingletonEvents', () => {
  it('create', () => {
    const events = CodeEditorSingletonEvents.create(bus);
    expect(is.observable(events.$)).to.eql(true);

    let count = 0;
    events.$.subscribe(() => count++);
    bus.fire({
      type: 'CodeEditor/change:focus',
      payload: { instance: 'foo' },
    });

    expect(count).to.eql(1);
  });

  it('only "CodeEditor/" events (filter generic bus)', () => {
    const bus = rx.bus();
    const events = CodeEditorSingletonEvents.create(bus);

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

    bus.fire({ type: 'CodeEditor/change:focus', payload: { instance: 'foo' } });
    expect(count).to.eql(1);
  });

  it('singleton$', () => {
    const bus = rx.bus();
    const events = CodeEditorSingletonEvents.create(bus);

    let count = 0;
    events.singleton$.subscribe(() => count++);

    bus.fire({ type: 'CodeEditor/foo', payload: {} }); // Global
    bus.fire({ type: 'CodeEditor/foo', payload: { instance: 'foo' } });

    expect(count).to.eql(1);
  });

  it('instance$', () => {
    const bus = rx.bus();
    const events = CodeEditorSingletonEvents.create(bus);

    let count = 0;
    events.instance$.subscribe(() => count++);

    bus.fire({ type: 'CodeEditor/foo', payload: {} }); // Global
    bus.fire({ type: 'CodeEditor/foo', payload: { instance: 'foo' } });

    expect(count).to.eql(1);
  });
});
