import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  Sample: import('./ui/DEV.Sample/dev/DEV'),
  Sample__0_0_0: import('./ui/DEV.Sample-0.0.0/DEV'),
  SampleDeploy: import('./ui/DEV.Sample.Deploy/DEV'),

  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),

  LocalPeerCard: import('./ui/LocalPeer.Card/dev/DEV'),
  Label: import('./ui/Label/dev/DEV'),
  NetworkCard: import('./ui/Network.Card/dev/DEV'),
  Networks: import('./ui/DEV.Networks/DEV'),

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
