import { t, expect, rx } from '../test';
import { BusController } from '.';

describe('BusConstroller', () => {
  it('init', () => {
    const bus = rx.bus<t.VercelEvent>();
    const controller = BusController({ bus });

    console.log('Boolean(controller)', Boolean(controller));
  });
});
