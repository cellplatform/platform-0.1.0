import React from 'react';

import { t, rx } from '../common';
import { DevHarness } from '../Dev.Harness';

const entry: t.ModuleDefaultEntry = (pump, ctx) => {
  console.group('🌳 ModuleDefaultEntry (Net.DevHarness)');
  console.log('event:', pump.id);
  console.log('ctx:', ctx);
  console.log('namespace:', ctx.source.namespace);
  console.log('source:', ctx.source.url);
  console.groupEnd();

  const localbus = rx.bus();
  rx.pump.connect(pump).to(localbus);

  return <DevHarness bus={localbus} />;
};

export default entry;
