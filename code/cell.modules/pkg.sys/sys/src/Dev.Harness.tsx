import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  Sample: import('./web.ui/Sample/dev/DEV'),
};

const url = new URL(location.href);
const dev = url.searchParams.get('dev');

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} />
);
