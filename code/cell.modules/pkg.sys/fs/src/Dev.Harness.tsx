import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Drop: import('./test.dev/Drop/DEV'),

  FsDriverIndexedDb: import('./web.ui/FsDriver.IndexedDb/dev/DEV'),
  FsIndexedDb: import('./web.ui/FsBus.IndexedDb/dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');
export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
