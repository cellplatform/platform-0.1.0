import { t, expect, rx } from '../test';
import { VercelBus } from '.';
import { DEFAULT } from './common';

describe.only('BusConstroller', () => {
  const bus = rx.bus<t.VercelEvent>();

  describe('ModuleInfo', function () {
    this.timeout(30000);

    it('defaults', async () => {
      const events = VercelBus.Events({ bus });
      VercelBus.Controller({ bus });

      const res = await events.moduleInfo.get();
      expect(res.info?.version).to.eql(DEFAULT.version);
    });
  });
});
