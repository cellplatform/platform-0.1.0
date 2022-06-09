import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  LocalPeerCard: import('./ui/LocalPeerCard/dev/DEV'),
  Label: import('./ui/Label/dev/DEV'),
  NetbusCard: import('./ui/NetbusCard/dev/DEV'),
  NetworkCard: import('./ui/NetworkCard/dev/DEV'),
  Networks: import('./ui/DEV.Networks/DEV'),

  Sample: import('./ui/DEV.Sample/DEV'),
  SampleDeploy: import('./ui/DEV.Sample.Deploy/DEV'),
  SampleApp: import('./ui/DEV.Sample.App/dev/DEV'),

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
