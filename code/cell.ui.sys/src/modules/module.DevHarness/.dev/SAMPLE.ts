import { SampleModule } from '../../../components.dev/module.Sample';
import { Shell } from '../../module.Shell';
import { t } from '../common';
import { OneModule } from './module.One';
import { ThreeModule } from './module.Three';
import { TwoModule } from './module.Two';
import { DevBuilder2 } from '../language/DevBuilder2';

/**
 * Simulate module insertion into DevHarness.
 */
export async function sampleInit(bus: t.EventBus) {
  const fire = bus.type<t.HarnessEvent>().fire;

  const sample = SampleModule.init(bus);
  const one = OneModule.dev(bus);
  const two = TwoModule.init(bus);
  const three = ThreeModule.init(bus);

  fire({ type: 'Harness/add', payload: { module: one.id } });
  fire({ type: 'Harness/add', payload: { module: one.id } }); // NB: Does not fail (double entry)
  fire({ type: 'Harness/add', payload: { module: two.id } });
  fire({ type: 'Harness/add', payload: { module: three.id } });

  fire({ type: 'Harness/add', payload: { module: sample.id } });

  // const node = Shell.builder({ bus, module: one });
  // console.log('node', node);

  const f = DevBuilder2(bus);
  fire({ type: 'Harness/add', payload: { module: f.id } });
}
