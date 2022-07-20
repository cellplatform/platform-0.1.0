import React from 'react';

import { App } from '../ui/DEV.Sample';
import { t } from '../common';

/**
 * Default entry function (sample).
 */
const entry: t.ModuleDefaultEntry = (bus, ctx) => {
  console.group('🌳 ModuleDefaultEntry');
  console.log('bus', bus);
  console.log('ctx', ctx);
  console.log('namespace', ctx.source.namespace);
  console.log('source', ctx.source.url);
  console.groupEnd();

  return <App bus={bus} />;
};

export default entry;
