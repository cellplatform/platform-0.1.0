import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Monaco: import('./components/Monaco/DEV'),
  CodeEditor: import('./components/CodeEditor/dev/DEV'),
  DevEnv: import('./components/DevEnv/dev/DEV'),

  Fileystem: import('./test.dev/Filesystem.dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
