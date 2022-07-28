import { Test, expect, t, TestHandlerArgs } from '..';
import { CodeEditor } from '../../api';

const Util = {
  ctx(e: TestHandlerArgs) {
    const bus = e.ctx?.bus as t.EventBus;
    const events = CodeEditor.events(bus);
    return { bus, events };
  },
};

export default Test.describe('CodeEditor Instances', (e) => {
  e.it('global status', async (e) => {
    const ctx = Util.ctx(e);
    expect(123).to.eql(123);

    const res = await ctx.events.status.get();

    console.log('ctx.events.status.get | res:', res); // TEMP 🐷
    expect(res?.ready).to.eql(true);

    /**
     * TODO 🐷
     *
     *    await rx.waitFor.first(ob$);
     *
     */

    ctx.events.status.updated$.subscribe((e) => {
      console.log('updated', e);
    });
  });
});
