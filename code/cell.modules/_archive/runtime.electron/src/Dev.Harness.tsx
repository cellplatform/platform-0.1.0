import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Manifest: import('./web.ui/Manifest/dev/DEV'),
};

const dev = new URL(location.href).searchParams.get('dev');

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
