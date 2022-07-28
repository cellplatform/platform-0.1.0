import React from 'react';

import { t } from '../common';
import { App } from '../ui/Dev.Sample';
import { CommonEntry } from './Export.util';

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  const { bus } = await CommonEntry.init(pump, ctx);
  return <App bus={bus} fs={{ id: 'fs.sample', path: 'sample/markdown.md' }} />;
};

export default entry;
