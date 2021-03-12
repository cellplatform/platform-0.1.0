import React from 'react';
import { Harness } from 'sys.ui.dev';

import Peer from './components/Peer/DEV';
export const ACTIONS = [Peer];

export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
