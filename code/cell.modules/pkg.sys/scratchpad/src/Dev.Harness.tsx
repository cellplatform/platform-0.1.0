import React from 'react';
import { Harness } from 'sys.ui.dev';

import Vimeo from './components/Vimeo/Vimeo.DEV';
import VimeoBackground from './components/Vimeo/VimeoBackground.DEV';
import Conversation from './components/Conversation/DEV';
// import Peer from './components/Conversation/Peer/Peer.DEV';

export const ACTIONS = [Conversation, Vimeo, VimeoBackground];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
