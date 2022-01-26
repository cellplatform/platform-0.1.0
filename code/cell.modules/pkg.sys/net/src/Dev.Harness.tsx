import React from 'react';
import { Harness } from 'sys.ui.dev';

import { t } from './common';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  PeerNetwork: import('./web.PeerNetwork/dev/DEV'),
  PeerNetworkHook: import('./web.ui.hooks/usePeerNetwork/dev/DEV'),
  UnitTests: import('./web.ui/dev/DEV.UnitTests'),
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
