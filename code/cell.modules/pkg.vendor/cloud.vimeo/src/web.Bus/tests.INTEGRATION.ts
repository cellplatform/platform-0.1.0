import { VimeoBus } from '.';
import { expect, TestOS } from '../test';

const token = process.env.VIMEO_TEST_TOKEN ?? '';

const TestSetup = () => {
  const { bus, fs } = TestOS;
  const controller = VimeoBus.Controller({ token, bus, fs });
  const events = controller.events;
  const dispose = controller.dispose;

  return { controller, events, dispose, bus, fs };
};

describe.only('INTEGRATION: VimeoBus', function () {
  this.timeout(9999);

  describe('info', () => {
    it('default', async () => {
      const { events } = TestSetup();
      const res = await events.info.get();
      expect(res.id).to.eql('default-instance');
      expect(res.info?.api.version).to.eql('3.4');
      expect(res.me).to.eql(undefined);
    });

    it('me (authenticated user)', async () => {
      const { events } = TestSetup();
      const res = await events.info.get();
      expect(res.id).to.eql('default-instance');
      expect(res.info?.api.version).to.eql('3.4');
    });
  });
});
