import React from 'react';

import { t } from './common';
import { Harness } from './web.ui/Harness';

const imports = {
  sample1: import('./test/sample-1/DEV'),
  sample2: import('./test/sample-2/DEV'),
  sample3: import('./test/sample-3/DEV'),
  sample4: import('./test/sample-4/DEV'),

  Harness: import('./web.ui/Harness/dev/DEV'),
  Textbox: import('./web.ui/Textbox/dev/DEV'),
  OptionButtons: import('./web.ui/OptionButtons/dev/DEV'),

  TestSuite: import('./web.ui/TestSuite/dev/DEV'),
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
      showActions={true}
    />
  );
};

export default DevHarness;
