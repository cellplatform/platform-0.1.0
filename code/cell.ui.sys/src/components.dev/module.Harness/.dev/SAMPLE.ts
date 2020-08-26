import { t } from '../common';

import { SampleModule } from '../../ModuleView.dev/module.Sample';

/**
 * Simulate module insertion into UIHarness.
 */
export async function sampleInit(ctx: t.IAppContext) {
  const bus = ctx.bus.type<t.HarnessEvent>();

  const module = SampleModule.init(ctx.bus.type());

  bus.fire({ type: 'Harness/add', payload: { module: module.id } });
}
