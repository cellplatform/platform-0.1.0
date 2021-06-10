import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  PeerNetwork: import('./PeerNetwork/dev/DEV'),
  CrdtOLD: import('./NetworkModel/Crdt.OLD/dev/DEV'),
};

const isLocalhost = location.hostname === 'localhost';
const ns = new URL(location.href).searchParams.get('ui.dev.ns');

export const DevHarness: React.FC = () => (
  <Harness actions={Object.values(imports)} initial={ns} showActions={!isLocalhost} />
);
