import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  CodeEditor: import('./components/CodeEditor/DEV'),
  Monaco: import('./components/Monaco/DEV'),

  Fileystem: import('./test.dev/Filesystem.dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
