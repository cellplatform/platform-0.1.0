import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './web/common';

const imports = {
  ModuleInfo: import('./web/ui/ModuleInfo/dev/DEV'),
  VercelHttp: import('./web/ui/VercelHttp/dev/DEV'),
  Deploy: import('./web/ui/Deploy/dev/DEV'),
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
