import React from 'react';

import { DevHarness } from '../Dev.Harness';
import { t, rx } from '../common';

/**
 * Default entry function (sample).
 */
const entry: t.ModuleDefaultEntry = (pump, ctx) => {
  const localbus = rx.bus();
  rx.pump.connect(pump).to(localbus);

  console.group('🌳 ModuleDefaultEntry (Doc DevHarness)');
  console.log('event', pump.id);
  console.log('ctx', ctx);
  console.log('namespace', ctx.source.namespace);
  console.log('source', ctx.source.url);
  console.groupEnd();

  return <DevHarness bus={localbus} />;
};

export default entry;
