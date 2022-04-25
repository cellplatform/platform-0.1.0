import { Test, expect } from 'sys.ui.dev';
import { TextInput } from '.';
import { rx, t } from './common';

export default Test.describe('TextInput', (e) => {
  e.describe('Events', (e) => {
    e.it('exposed from <CmdCard.Events>', () => {
      const instance = { bus: rx.bus(), id: 'foo' };
      const events = TextInput.Events({ instance });
      expect(events.instance.id).to.eql(instance.id);
      expect(events.instance.bus).to.eql(rx.bus.instance(instance.bus));
    });

    e.it('clone (non-disposable)', () => {
      const events = TextInput.Events({ instance: { bus: rx.bus(), id: 'foo' } });
      const clone = events.clone();
      expect((clone as any).dispose).to.eql(undefined);
    });
  });
});
