import { Test, expect } from 'sys.ui.dev';
import { CmdCard } from '.';
import { t, rx } from './common';

export default Test.describe('Cmd.Card', (e) => {
  const instance = 'my-instance';

  e.describe('Events', (e) => {
    e.it('exposed from <CmdCard.Events>', () => {
      const bus = rx.bus();
      const events = CmdCard.Events({ bus, instance });

      expect(events.instance).to.eql(instance);
      expect(events.bus).to.eql(rx.bus.instance(bus));
    });
  });
});
