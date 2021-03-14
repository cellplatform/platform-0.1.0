import React from 'react';
import { Harness } from 'sys.ui.dev';

import Peer from './components/NetworkPeer/DEV';
export const ACTIONS = [Peer];

export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
