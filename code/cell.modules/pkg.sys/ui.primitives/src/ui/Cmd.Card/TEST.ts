import { Test, expect } from 'sys.ui.dev';
import { CmdCard } from '.';
import { t, rx, slug, Util } from './common';

const Setup = {
  instance: (): t.CmdCardInstance => ({ bus: rx.bus(), id: `foo.${slug()}` }),
  controller() {
    const instance = Setup.instance();
    const controller = CmdCard.Controller({ instance });
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

    e.it('clone (non-disposable)', () => {
      const events = CmdCard.Events({ instance: { bus: rx.bus(), id: 'foo' } });
      const clone = events.clone();
      expect((clone as any).dispose).to.eql(undefined);
    });

    e.it.skip('initial', () => {
      const render = () => null;
      const initial = () => Util.state.default({});

      const test = (initial: t.CmdCardControllerArgs['initial']) => {
        const events = CmdCard.Events({ instance: { bus: rx.bus(), id: 'foo' }, initial });
        // expect(events.state.current.body.render).to.equal(render);
      };

      test(initial());
      test(initial);
    });

    e.describe('state', (e) => {
      e.it('get (default state)', async () => {
        const { dispose, events } = Setup.controller();
        const res = await events.state.get();
        expect(res.value).to.eql(Util.state.default());
        dispose();
      });

      // e.it('patch', async () => {
      //   const { dispose, events } = Setup.controller();
      //   await events.state.patch((prev) => (prev.commandbar.text = 'hello'));
      //   expect((await events.state.get()).value?.commandbar.text).to.eql('hello');
      //   dispose();
      // });

      // e.it('state$ (Observable)', async () => {
      //   const { dispose, events } = Setup.controller();

      //   const fired: t.CmdCardState[] = [];
      //   events.state.$.subscribe((e) => fired.push(e.value));

      //   await events.state.patch((prev) => (prev.commandbar.text = 'hello'));
      //   expect(fired.length).to.eql(2);
      //   expect(fired[1].commandbar.text).to.eql('hello');

      //   dispose();
      // });
    });
  });

  e.describe('Controller', (e) => {
    e.it.skip('initial', () => {
      const render = () => null;
      const initial = () => Util.state.default({});

      const test = (initial: t.CmdCardControllerArgs['initial']) => {
        const events = CmdCard.Controller({ instance: { bus: rx.bus(), id: 'foo' }, initial });
        // expect(events.state.current.body.render).to.equal(render);
      };

      test(initial());
      test(initial);
    });
  });
});
