import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  CodeEditor: import('./components/CodeEditor/DEV'),
  Monaco: import('./components/Monaco/DEV'),

  Fileystem: import('./test.dev/DEV.Filesystem/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
