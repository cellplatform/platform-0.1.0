import React from 'react';
import { Harness } from 'sys.ui.dev';

import Conversation from './components/Conversation/DEV';
import Peer from './components/Conversation/Peer/DEV';
import Slider from './components/Slider/DEV';

export const ACTIONS = [Conversation, Peer, Slider];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
