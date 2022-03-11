import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  Sample: import('./web.ui/dev.Sample/DEV'),
  UnitTests: import('./web.ui/dev.UnitTests/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
