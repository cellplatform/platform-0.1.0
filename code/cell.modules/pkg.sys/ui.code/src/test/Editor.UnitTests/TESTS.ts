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
    console.log('e', e);

    const ctx = Util.ctx(e);
    expect(123).to.eql(123);

    // const events = CodeEditor.events(ctx.bus);
    const res = await ctx.events.status.get();

    console.log('res', res);
  });
});
