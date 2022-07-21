import { rx, t } from '../common';
import { expect, is, Test } from '../../test';
import { InstanceEvents } from './Events.Instance';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();
const id = 'foo';

export default Test.describe('Events: Instance', (e) => {
  e.it('create', () => {
    const events = InstanceEvents({ bus, id });
    expect(is.observable(events.$)).to.eql(true);

    let count = 0;
    events.$.subscribe(() => count++);
    bus.fire({
      type: 'sys.ui.code/focus',
      payload: { instance: 'foo' },
    });

    expect(count).to.eql(1);
  });

  e.it('only "CodeEditor/" instance events (filter generic bus)', () => {
    const bus = rx.bus();
    const events = InstanceEvents({ bus, id });

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
    notFired({ type: 'sys.ui.code/foo', payload: {} }); // NB: Global code-editor event.

    bus.fire({
      type: 'sys.ui.code/change:focus',
      payload: { instance: 'foo' },
    });
    expect(count).to.eql(1);
  });
});
