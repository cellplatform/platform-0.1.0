import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  PeerNetwork: import('./PeerNetwork/dev/DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
