import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  UnitTests: import('./web.ui/dev/DEV.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const actions = Object.values(imports);

export const DevHarness: React.FC = () => <Harness actions={actions} initial={dev} />;
export default DevHarness;
