import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  PeerNetwork: import('./PeerNetwork/dev/DEV'),
  CrdtOLD: import('./NetworkModel/Crdt.OLD/dev/DEV'),
};

const url = new URL(location.href);
const dev = url.searchParams.get('dev');
const isLocalhost = url.hostname === 'localhost';

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={dev} showActions={isLocalhost} />
);
