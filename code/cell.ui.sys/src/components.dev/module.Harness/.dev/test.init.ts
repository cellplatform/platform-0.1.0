import { t } from '../common';

import { SampleModule } from '../../ModuleView.dev/module.Sample';

/**
 * Simulate module insertion into UIHarness.
 */
export async function testHarnessInit(ctx: t.IAppContext) {
  const module = SampleModule.init(ctx.bus.type());

  const bus = ctx.bus.type<t.HarnessEvent>();
  bus.fire({ type: 'Harness/add', payload: { module: module.id } });
}



