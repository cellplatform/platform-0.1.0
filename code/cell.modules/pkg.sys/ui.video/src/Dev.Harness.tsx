import React from 'react';
import { Harness } from 'sys.ui.dev';

import Vimeo from './components/Vimeo/Vimeo.DEV';
import VimeoBackground from './components/Vimeo/VimeoBackground.DEV';
export const ACTIONS = [Vimeo, VimeoBackground];

export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
