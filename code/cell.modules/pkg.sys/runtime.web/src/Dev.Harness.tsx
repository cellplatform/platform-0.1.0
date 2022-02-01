import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),

  UnitTests: import('./dev/DEV.UnitTests'),

  useManifest: import('./web.ui/useManifest/dev/DEV'),
  useModuleTarget: import('./web.ui/useModuleTarget/dev/DEV'),
  useModule: import('./web.ui/useModule/dev/DEV'),

  ManifestSelector: import('./web.ui/ManifestSelector/dev/DEV'),
  Module: import('./web.ui/Module/dev/DEV'),
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
