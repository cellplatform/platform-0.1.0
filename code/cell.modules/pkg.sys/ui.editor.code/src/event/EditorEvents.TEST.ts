import { Subject } from 'rxjs';

import { expect, is, rx, t } from '../test';
import { EditorEvents } from './EditorEvents';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();

describe('CodeEditorEvents', () => {
  it('create: from bus', () => {
    const events = EditorEvents(bus);
    expect(is.observable(events.$)).to.eql(true);
  });

  it('create: from subject', () => {
    const event$ = new Subject<E>();
    const events = EditorEvents(event$);

    expect(is.observable(events.$)).to.eql(true);

    let count = 0;
    events.$.subscribe(() => count++);
    event$.next({
      type: 'CodeEditor/changed:focus',
      payload: { instance: 'foo', isFocused: true },
    });

    expect(count).to.eql(1);
  });

  it('$: only CodeEditor or Monaco events', () => {
    const bus = rx.bus();
    const events = EditorEvents(bus);

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
      type: 'CodeEditor/changed:focus',
      payload: { instance: 'foo', isFocused: true },
    });
    expect(count).to.eql(1);
  });

  it('fire', () => {
    const bus = rx.bus();
    const events = EditorEvents(bus);

    let count = 0;
    bus.event$.subscribe(() => count++);

    events.fire({
      type: 'CodeEditor/changed:focus',
      payload: { instance: 'foo', isFocused: true },
    });

    expect(count).to.eql(1);
  });
});
