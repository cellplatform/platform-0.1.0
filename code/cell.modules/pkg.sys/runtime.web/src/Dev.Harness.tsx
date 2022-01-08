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
const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const actions = Object.values(imports);

export const DevHarness: React.FC = () => <Harness actions={actions} initial={dev} />;
export default DevHarness;
