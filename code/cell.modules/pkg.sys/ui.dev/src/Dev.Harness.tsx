import React from 'react';

import { Harness } from './ui/Harness';

const imports = {
  sample1: import('./test/sample-1/DEV'),
  sample2: import('./test/sample-2/DEV'),
  sample3: import('./test/sample-3/DEV'),

  Harness: import('./ui/Harness/DEV'),
  Textbox: import('./ui/Textbox/DEV'),
  OptionButtons: import('./ui/OptionButtons/DEV'),

  TestSuite: import('./ui/TestSuite/dev/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');
export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} showActions={true} initial={ns} />
);
