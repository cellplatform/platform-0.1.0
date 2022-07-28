import React from 'react';

import { t } from '../common';
import { DevHarness } from '../Dev.Harness';
import { CommonEntry } from './Export.util';

export { DevHarness };

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  const { bus } = await CommonEntry.init(pump, ctx);
  return <DevHarness bus={bus} />;
};

export default entry;
