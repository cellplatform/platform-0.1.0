import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  useManifest: import('./web.ui/useManifest/dev/DEV'),
  useModuleTarget: import('./web.ui/useModuleTarget/dev/DEV'),

  ManifestSelector: import('./web.ui/ManifestSelector/dev/DEV'),
  Module: import('./web.ui/Module/dev/DEV'),
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const actions = Object.values(imports);

export const DevHarness: React.FC = () => <Harness actions={actions} initial={dev} />;
export default DevHarness;
