import React from 'react';
import { Harness } from 'sys.ui.dev';

import VideoStream from './components/VideoStream/DEV';
import Vimeo from './components/Vimeo/Vimeo.DEV';
import VimeoBackground from './components/Vimeo/VimeoBackground.DEV';

export const ACTIONS = [VideoStream, Vimeo, VimeoBackground];

export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
