import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  CodeEditor: import('./components/CodeEditor/DEV'),
  Monaco: import('./components/Monaco/DEV'),
};

const ns = new URL(location.href).searchParams.get('ui.dev.ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
