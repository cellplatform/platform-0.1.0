import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  LocalPeerCard: import('./web.ui/LocalPeerCard/dev/DEV'),
  NetbusCard: import('./web.ui/NetbusCard/dev/DEV'),
  Label: import('./web.ui/Label/dev/DEV'),
  Networks: import('./web.ui/DEV.Networks/DEV'),
  Sample: import('./web.ui/DEV.Sample/DEV'),

  UnitTests: import('./Dev.UnitTests'),
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
      showActions={url.hostname === 'localhost'}
    />
  );
};

export default DevHarness;
