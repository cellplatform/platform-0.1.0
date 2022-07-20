import React from 'react';

import { t } from '../common';
import { DevHarness } from '../Dev.Harness';
import { CommonEntry } from './Export.util';

export { DevHarness };

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = (bus, ctx) => {
  CommonEntry.init(bus, ctx);
  return <DevHarness bus={bus} />;
};

export default entry;
