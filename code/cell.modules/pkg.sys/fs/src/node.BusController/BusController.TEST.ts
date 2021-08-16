import { t, expect, rx, Filesystem } from '../test';
import { FsBus } from '.';

describe.only('BusController', () => {
  const bus = rx.bus<t.SysFsEvent>();

  describe('Info (Module)', function () {
    this.timeout(30000);

    const prep = (options: { id?: string; dir?: string } = {}) => {
      const id = options.id ?? 'foo';

      const fs = !options.dir
        ? Filesystem.local
        : Filesystem.LocalFilesystem({
            dir: Filesystem.node.join(Filesystem.tmp, options.dir),
            fs: Filesystem.node,
          });

      const controller = FsBus.Controller({ id, fs, bus });
      const events = FsBus.Events({ id, bus });

      return {
        controller,
        events,
        dispose() {
          controller.dispose();
          events.dispose();
        },
      };
    };

    it('defaults', async () => {
      const id = 'foo';
      const fs = Filesystem.local;
      const controller = FsBus.Controller({ id, fs, bus });
      const events = FsBus.Events({ id, bus });

      const res = await events.info.get();
      controller.dispose();

      expect(res.info?.dir).to.eql(Filesystem.node.join(Filesystem.tmp, 'root'));
    });

    it('filter (controller)', async () => {
      const id = 'foo';
      const fs = Filesystem.local;

      let allow = true;
      const controller = FsBus.Controller({ id, fs, bus, filter: (e) => allow });
      const events = FsBus.Events({ id, bus });

      const res1 = await events.info.get();
      allow = false;
      const res2 = await events.info.get({ timeout: 10 });
      controller.dispose();

      expect(res1.error).to.eql(undefined);
      expect(res2.error).to.include('timed out');
    });

    it.only('distinct (by filesystem "id")', async () => {
      const one = prep({ id: 'one', dir: 'foo' });
      const two = prep({ id: 'two', dir: 'bar' });

      const info1 = await one.events.info.get();
      const info2 = await two.events.info.get();

      one.dispose();
      two.dispose();

      expect(info1.id).to.eql('one');
      expect(info2.id).to.eql('two');

      expect(info1.info?.id).to.eql('one');
      expect(info2.info?.id).to.eql('two');

      expect(info1.info?.dir).to.match(/\/foo$/);
      expect(info2.info?.dir).to.match(/\/bar$/);
    });
  });
});
