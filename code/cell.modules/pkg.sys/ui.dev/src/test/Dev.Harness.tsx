import React from 'react';

import { Harness } from '../components/Harness';

const imports = {
  sample1: import('./sample-1/DEV'),
  sample2: import('./sample-2/DEV'),
  sample3: import('./sample-3/DEV'),
  Harness: import('../components/Harness/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
