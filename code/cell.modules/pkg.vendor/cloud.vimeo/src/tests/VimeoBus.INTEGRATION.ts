import { VimeoBus } from '../node.Bus';
import { expect, TestOS, PATH } from '../test';

const token = process.env.VIMEO_TEST_TOKEN ?? '';

const TestSetup = () => {
  return VimeoBus.create({ token, dir: PATH.TMP });
};

describe('INTEGRATION: VimeoBus', function () {
  this.timeout(9999);

  describe.only('info', () => {
    it('default', async () => {
      const vimeo = TestSetup();
      const res = await vimeo.info.get();
      expect(res.id).to.eql('default-instance');
      expect(res.info?.api.version).to.eql('3.4');
      expect(res.me).to.eql(undefined);
    });

    it('me (authenticated user)', async () => {
      const vimeo = TestSetup();
      const res = await vimeo.info.get();
      expect(res.id).to.eql('default-instance');
      expect(res.info?.api.version).to.eql('3.4');
    });
  });
});
