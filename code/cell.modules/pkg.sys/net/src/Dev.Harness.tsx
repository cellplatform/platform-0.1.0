import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  LocalPeerCard: import('./web.ui/LocalPeerCard/dev/DEV'),
  NetbusCard: import('./web.ui/NetbusCard/dev/DEV'),
  Label: import('./web.ui/Label/dev/DEV'),
  CommandTextbox: import('./web.ui/Command.Textbox/dev/DEV'),
  Networks: import('./web.ui/dev.Networks/DEV'),
  UnitTests: import('./web.ui/dev/DEV.UnitTests'),
  SamplePeerNetwork: import('./web.PeerNetwork/dev/DEV'),
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
