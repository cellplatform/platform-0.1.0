import React from 'react';

import { Harness } from './ui/Harness';
import { rx, t } from './common';

const imports = {
  sample1: import('./test/sample-1/DEV'),
  sample2: import('./test/sample-2/DEV'),
  sample3: import('./test/sample-3/DEV'),

  Harness: import('./ui/Harness/DEV'),
  Textbox: import('./ui/Textbox/DEV'),
  OptionButtons: import('./ui/OptionButtons/DEV'),

  TestSuite: import('./ui/TestSuite/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  const url = new URL(location.href);
  return (
    <Harness
      bus={props.bus}
      actions={Object.values(imports)}
      initial={url.searchParams.get('dev')}
      showActions={url.hostname === 'localhost'}
    />
  );
};

export default DevHarness;
