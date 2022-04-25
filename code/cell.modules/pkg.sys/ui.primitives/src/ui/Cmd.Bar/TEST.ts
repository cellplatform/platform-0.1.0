import { Subject } from 'rxjs';
import { expect, Test } from 'sys.ui.dev';

import { CmdBar } from '.';
import { rx, t, time } from './common';

export default Test.describe('Cmd.Bar', (e) => {
  e.describe('Events', (e) => {
    e.it('exposed from <CmdBar.Events>', () => {
      const instance = { bus: rx.bus(), id: 'foo' };
      const events = CmdBar.Events({ instance });
      expect(events.instance.id).to.eql(instance.id);
      expect(events.instance.bus).to.eql(rx.bus.instance(instance.bus));
      events.dispose();
    });

    e.it('clone (non-disposable)', () => {
      const events = CmdBar.Events({ instance: { bus: rx.bus(), id: 'foo' } });
      const clone = events.clone();
      expect((clone as any).dispose).to.eql(undefined);
      events.dispose();
    });
  });

  e.describe('Controller', (e) => {
    e.it('returns <CmdBar.Events>', async () => {
      const instance = { bus: rx.bus(), id: 'foo' };
      const controller = CmdBar.Controller({ instance });
      expect((controller.clone() as any).dispose).to.eql(undefined); // NB: Sample.
    });
  });
});
