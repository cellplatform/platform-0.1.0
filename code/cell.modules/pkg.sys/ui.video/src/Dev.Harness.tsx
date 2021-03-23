import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  VideoStream: import('./components/VideoStream/DEV'),
  Vimeo: import('./components/Vimeo/Vimeo.DEV'),
  VimeoBackground: import('./components/Vimeo/VimeoBackground.DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
