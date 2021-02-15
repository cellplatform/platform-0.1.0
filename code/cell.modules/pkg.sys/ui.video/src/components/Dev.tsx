import React from 'react';
import { Harness } from 'sys.ui.dev';

import Component from './Component/Component.DEV';
import Vimeo from './Vimeo/Vimeo.DEV';
import VimeoBackground from './Vimeo/VimeoBackground.DEV';

export const ACTIONS = [Component, Vimeo, VimeoBackground];

export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
