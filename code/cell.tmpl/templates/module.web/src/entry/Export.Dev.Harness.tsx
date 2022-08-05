import React from 'react';

import { rx, t } from '../common';
import { DevHarness } from '../Dev.Harness';

export { DevHarness };

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  const bus = rx.bus();
  rx.pump.connect(pump).to(bus);
  console.log(`💦 entry | ${ctx.source.namespace}`, ctx);
  return <DevHarness bus={bus} />;
};

export default entry;
