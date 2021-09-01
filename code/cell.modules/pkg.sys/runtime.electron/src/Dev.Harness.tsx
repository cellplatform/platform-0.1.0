import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Manifest: import('./web.ui/Manifest/dev/DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
