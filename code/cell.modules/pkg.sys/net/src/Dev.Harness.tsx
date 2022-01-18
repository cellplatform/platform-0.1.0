import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  PeerNetwork: import('./PeerNetwork/dev/DEV'),
  UnitTests: import('./web.ui/dev/DEV.UnitTests'),
};

const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const isLocalhost = url.hostname === 'localhost';

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} showActions={isLocalhost} />
);
