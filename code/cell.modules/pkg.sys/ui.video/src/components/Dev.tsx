import React from 'react';
import { Harness } from 'sys.ui.dev';

import Vimeo from './Vimeo/Vimeo.DEV';
import VimeoBackground from './Vimeo/VimeoBackground.DEV';
import Conversation from './Conversation/Conversation.DEV';
import Peer from './Conversation/Peer/Peer.DEV';

export const ACTIONS = [Vimeo, VimeoBackground, Conversation, Peer];
export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
