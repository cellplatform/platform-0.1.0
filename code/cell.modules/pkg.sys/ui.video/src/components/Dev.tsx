import React from 'react';
import { Harness } from 'sys.ui.dev';

import Vimeo from './Vimeo/Vimeo.DEV';
import VimeoBackground from './Vimeo/VimeoBackground.DEV';
import Peer from './Peer/Peer.DEV';

export const ACTIONS = [Vimeo, VimeoBackground, Peer];
export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
