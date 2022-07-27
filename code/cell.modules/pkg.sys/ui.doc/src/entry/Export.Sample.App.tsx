import React from 'react';

import { App } from '../ui/DEV.Sample';
import { t, rx } from '../common';

/**
 * Default entry function (sample).
 */
const entry: t.ModuleDefaultEntry = (pump, ctx) => {
  const localbus = rx.bus();
  rx.pump.connect(pump).to(localbus);

  console.group('🌳 ModuleDefaultEntry: (App)');
  console.log('event', pump.id);
  console.log('ctx', ctx);
  console.log('namespace', ctx.source.namespace);
  console.log('source', ctx.source.url);
  console.groupEnd();

  return <App bus={localbus} />;
};

export default entry;
