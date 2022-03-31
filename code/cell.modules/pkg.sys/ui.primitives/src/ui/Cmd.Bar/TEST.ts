import { Subject } from 'rxjs';
import { expect, Test } from 'sys.ui.dev';

import { CmdBar } from '.';
import { rx, t, time } from './common';

export default Test.describe('Cmd.Bar', (e) => {
  e.describe('Events', (e) => {
    e.it('exposed from <CmdBar.Events>', () => {
      const bus = rx.bus();
      const id = 'foo';
      const events = CmdBar.Events({ instance: { bus, id } });

      expect(events.instance.id).to.eql(id);
      expect(events.instance.bus).to.eql(rx.bus.instance(bus));
    });
  });

  e.describe('State.Controller', (e) => {
    e.it('logs history (from bus property)', async () => {
      const sample: t.Event = { type: 'FOO', payload: {} };
      const instance = { bus: rx.bus(), id: 'foo' };
      const bus = rx.bus();

      const dispose$ = new Subject<void>();
      const controller = CmdBar.State.Controller({ instance, bus, dispose$ });
      expect(controller.state.history).to.eql(undefined);

      instance.bus.fire(sample);
      await time.wait(60);
      expect(controller.state.history).to.eql(undefined); // Instance [bus] is not the same as the [bus] passed in as the property.

      bus.fire(sample);
      await time.wait(60);

      expect(controller.state.history?.total).to.eql(1);

      const events = controller.state.history?.events ?? [];
      expect(events.length).to.eql(1);
      expect(events[0].event).to.eql(sample);

      dispose$.next();
      bus.fire(sample);
      bus.fire(sample);
      await time.wait(60);
      expect(controller.state.history?.events.length).to.eql(1); // NB: no change after dispose.
    });
  });
});
