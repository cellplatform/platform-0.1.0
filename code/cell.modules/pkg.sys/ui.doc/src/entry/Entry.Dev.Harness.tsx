import React from 'react';

import { DevHarness } from '../Dev.Harness';
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

  return <DevHarness bus={bus} />;
};

export default entry;
