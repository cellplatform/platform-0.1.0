import { expect, Test } from 'sys.ui.dev';

import { Keyboard } from '.';
import { rx } from '../common';
import { SINGLETON_INSTANCE } from './constants';

export default Test.describe('hooks.Keyboard', (e) => {
  e.it('FOO', async () => {
    expect(123).to.eql(123);
  });

  e.describe('KeyboardState', (e) => {
    e.it('singleton', async () => {
      const bus1 = rx.bus();
      const bus2 = rx.bus();

      // KeyboardStateSingleton
      const state1 = Keyboard.State.singleton(bus1);
      const state2 = Keyboard.State.singleton(bus2);

      expect(state1).to.not.equal(state2); // NB: Different buses.

      expect(state1.bus).to.eql(rx.bus.instance(bus1));
      expect(state2.bus).to.eql(rx.bus.instance(bus2));

      expect(state1.instance).to.eql(SINGLETON_INSTANCE);
      expect(state2.instance).to.eql(SINGLETON_INSTANCE);

      // Singleton instances.
      expect(Keyboard.State.singleton(bus1)).to.equal(state1);
      expect(Keyboard.State.singleton(bus2)).to.equal(state2);
    });
  });
});
