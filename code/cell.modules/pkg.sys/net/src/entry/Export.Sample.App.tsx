import React from 'react';

import { t, rx } from '../common';
import { DevSampleApp } from '../ui/DEV.Sample';

const entry: t.ModuleDefaultEntry = (pump, ctx) => {
  console.group('🌳 ModuleDefaultEntry (Net.SampleApp)');
  console.log('event:', pump.id);
  console.log('ctx:', ctx);
  console.log('namespace:', ctx.source.namespace);
  console.log('source:', ctx.source.url);
  console.groupEnd();

  const localbus = rx.bus();
  rx.pump.connect(pump).to(localbus);

  return <DevSampleApp />;
};
export default entry;
