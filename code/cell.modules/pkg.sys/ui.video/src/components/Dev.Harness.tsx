import React from 'react';
import { Harness } from 'sys.ui.dev';

import Vimeo from './Vimeo/DEV';
import VimeoBackground from './Vimeo/DEV';
import Conversation from './Conversation/DEV';
import Peer from './Conversation/Peer/Peer.DEV';
import TransformParent from './TransformParent/DEV';

export const ACTIONS = [Conversation, Peer, Vimeo, VimeoBackground, TransformParent];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
