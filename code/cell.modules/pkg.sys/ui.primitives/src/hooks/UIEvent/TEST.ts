import { expect, Test } from 'sys.ui.dev';

import { UIEvent } from '.';
import { rx } from '../common';

export default Test.describe('hooks.UIEvent', (e) => {
  e.it('bus/instance', async () => {
    const bus = rx.bus();
    const instance = 'my-instance';
    const events = UIEvent.Events({ bus, instance });

    expect(events.bus).to.eql(rx.bus.instance(bus));
    expect(events.instance).to.eql(instance);
  });
});
