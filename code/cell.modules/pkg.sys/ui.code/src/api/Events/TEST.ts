import { expect, Is, Test } from '../../test';
import { rx, t } from '../common';
import { CodeEditorEvents } from './Events';
import { CodeEditorInstanceEvents } from './Events.Instance';

type E = t.CodeEditorEvent;
const bus = rx.bus<E>();

export default Test.describe('Events', (e) => {
  e.describe('Singleton (root)', (e) => {
    e.it('create', () => {
      const events = CodeEditorEvents(bus);
      expect(Is.observable(events.$)).to.eql(true);

      let count = 0;
      events.$.subscribe(() => count++);
      bus.fire({
        type: 'sys.ui.code/focus',
        payload: { instance: 'foo' },
      });

      expect(count).to.eql(1);
    });

    e.it('only "CodeEditor/" events (filter generic bus)', () => {
      const bus = rx.bus();
      const events = CodeEditorEvents(bus);

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

      bus.fire({ type: 'sys.ui.code/change:focus', payload: { instance: 'foo' } });
      expect(count).to.eql(1);
    });

    e.it('singleton$', () => {
      const bus = rx.bus();
      const events = CodeEditorEvents(bus);

      let count = 0;
      events.singleton$.subscribe(() => count++);

      bus.fire({ type: 'sys.ui.code/foo', payload: {} }); // Global
      bus.fire({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } });

      expect(count).to.eql(1);
    });

    e.it('instance$', () => {
      const bus = rx.bus();
      const events = CodeEditorEvents(bus);

      let count = 0;
      events.instance$.subscribe(() => count++);

      bus.fire({ type: 'sys.ui.code/foo', payload: {} }); // Global
      bus.fire({ type: 'sys.ui.code/foo', payload: { instance: 'foo' } });

      expect(count).to.eql(1);
    });
  });

  e.describe('Instance', (e) => {
    const bus = rx.bus<E>();
    const id = 'foo';

    e.it('create', () => {
      const events = CodeEditorInstanceEvents({ bus, id });
      expect(Is.observable(events.$)).to.eql(true);

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
      const events = CodeEditorInstanceEvents({ bus, id });

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
});
