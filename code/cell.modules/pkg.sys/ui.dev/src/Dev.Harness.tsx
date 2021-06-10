import React from 'react';

import { Harness } from './components/Harness';

const imports = {
  sample1: import('./test/sample-1/DEV'),
  sample2: import('./test/sample-2/DEV'),
  sample3: import('./test/sample-3/DEV'),

  Harness: import('./components/Harness/DEV'),
  Textbox: import('./components/Textbox/DEV'),
  OptionButtons: import('./components/OptionButtons/DEV'),
};

const ns = new URL(location.href).searchParams.get('ui.dev.ns');
export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} showActions={true} initial={ns} />
);
