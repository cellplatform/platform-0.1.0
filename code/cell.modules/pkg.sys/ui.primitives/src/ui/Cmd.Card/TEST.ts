import { Test, expect } from 'sys.ui.dev';
import { CmdCard } from '.';
import { t, rx } from './common';

export default Test.describe('Cmd.Card', (e) => {
  const instance = 'my-instance';

  e.describe('Events', (e) => {
    e.it('exposed from <CmdCard.Events>', () => {
      const bus = rx.bus();
      const id = 'foo';
      const events = CmdCard.Events({ instance: { bus, id } });

      expect(events.instance.id).to.eql(id);
      expect(events.instance.bus).to.eql(rx.bus.instance(bus));
    });
  });
});
