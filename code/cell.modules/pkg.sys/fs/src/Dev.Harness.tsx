import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Foo: import('./web.ui/Foo/dev/DEV'),
  Drop: import('./test.dev/Drop/DEV'),
  FsDriverIndexedDb: import('./web.FsDriverIndexedDb/dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');
export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
