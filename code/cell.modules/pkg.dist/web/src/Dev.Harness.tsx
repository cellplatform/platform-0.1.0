import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Root: import('./web.ui/Root/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const actions = Object.values(imports);

export const DevHarness: React.FC = () => <Harness actions={actions} initial={dev} />;
export default DevHarness;
