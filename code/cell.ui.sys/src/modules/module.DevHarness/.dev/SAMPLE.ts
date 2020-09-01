import { t, time } from '../common';
import { SampleModule } from '../../../components.dev/module.Sample';
import { OneModule } from './module.One';
import { TwoModule } from './module.Two';
import { ThreeModule } from './module.Three';

/**
 * Simulate module insertion into DevHarness.
 */
export async function sampleInit(bus: t.EventBus) {
  const fire = bus.type<t.HarnessEvent>().fire;

  const sample = SampleModule.init(bus);
  const one = OneModule.dev(bus);
  const two = TwoModule.init(bus);
  const three = ThreeModule.init(bus);

  // time.delay(800, () => {
  // });
  fire({ type: 'Harness/add', payload: { module: one.id } });
  fire({ type: 'Harness/add', payload: { module: one.id } }); // NB: Does not fail (double entry)
  fire({ type: 'Harness/add', payload: { module: two.id } });
  fire({ type: 'Harness/add', payload: { module: three.id } });

  fire({ type: 'Harness/add', payload: { module: sample.id } });
}
