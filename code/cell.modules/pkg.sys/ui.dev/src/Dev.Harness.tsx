import React from 'react';

import { t } from './common';
import { Harness } from './ui/Harness';

const imports = {
  sample1: import('./test/sample-1/DEV'),
  sample2: import('./test/sample-2/DEV'),
  sample3: import('./test/sample-3/DEV'),
  sample4: import('./test/sample-4/DEV'),

  Harness: import('./ui/Harness/dev/DEV'),
  Textbox: import('./ui/Textbox/dev/DEV'),
  OptionButtons: import('./ui/OptionButtons/dev/DEV'),

  TestSuite: import('./ui/TestSuite/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };
export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
