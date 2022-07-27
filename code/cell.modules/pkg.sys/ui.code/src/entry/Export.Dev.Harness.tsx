import React from 'react';

import { t } from '../common';
import { DevHarness } from '../Dev.Harness';
import { CommonEntry } from './Export.util';

export { DevHarness };

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  console.group('🌳 ModuleDefaultEntry (CodeEditor.DevHarness)');
  console.log('event:', pump.id);
  console.log('ctx:', ctx);
  console.log('namespace:', ctx.source.namespace);
  console.log('source:', ctx.source.url);
  console.groupEnd();

  const { bus } = await CommonEntry.init(pump, ctx);
  return <DevHarness bus={bus} />;
};

export default entry;
