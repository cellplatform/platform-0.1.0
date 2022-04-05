import { Test, expect } from 'sys.ui.dev';
import { CmdCard } from '.';
import { t, rx, slug } from './common';
import { Util } from './Util';

const Setup = {
  instance: (): t.CmdCardInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
  controller() {
    const instance = Setup.instance();
    const controller = CmdCard.State.Controller({ instance });
    const events = CmdCard.Events({ instance });
    const dispose = () => {
      controller.dispose();
      events.dispose();
    };
    return { instance, controller, dispose, events };
  },
};

export default Test.describe('Cmd.Card', (e) => {
  e.describe('Events', (e) => {
    e.it('exposed from <CmdCard.Events>', () => {
      const instance = { bus: rx.bus(), id: 'foo' };
      const events = CmdCard.Events({ instance });
      expect(events.instance.id).to.eql(instance.id);
      expect(events.instance.bus).to.eql(rx.bus.instance(instance.bus));
    });

    e.describe('state', (e) => {
      e.it('get (default state)', async () => {
        const { dispose, events } = Setup.controller();
        const res = await events.state2.get();
        expect(res.value).to.eql(Util.defaultState());
        dispose();
      });

      e.it('patch', async () => {
        const { dispose, events } = Setup.controller();
        await events.state2.patch((prev) => (prev.commandbar.text = 'hello'));
        expect((await events.state2.get()).value?.commandbar.text).to.eql('hello');
        dispose();
      });
    });
  });
});
