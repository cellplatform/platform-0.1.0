import { Test, expect } from 'sys.ui.dev';
import { CmdBar } from '.';
import { t, rx } from './common';

export default Test.describe('Cmd.Bar', (e) => {
  const instance = 'my-instance';

  e.describe('Events', (e) => {
    e.it('exposed from <CmdBar.Events>', () => {
      const bus = rx.bus();
      const events = CmdBar.Events({ bus, instance });

      expect(events.instance).to.eql(instance);
      expect(events.bus).to.eql(rx.bus.instance(bus));
    });
  });
});
