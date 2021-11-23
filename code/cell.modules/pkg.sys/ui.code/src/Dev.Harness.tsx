import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Monaco: import('./components/Monaco/dev/DEV'),
  CodeEditor: import('./components/CodeEditor/dev/DEV'),
  DevEnv: import('./components/DevEnv/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const actions = Object.values(imports);

export const DevHarness: React.FC = () => <Harness actions={actions} initial={dev} />;
export default DevHarness;
