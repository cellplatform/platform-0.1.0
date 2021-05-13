import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  MediaStream: import('./components/MediaStream/dev/DEV'),
  RecordButton: import('./components/RecordButton/dev/DEV'),
  Vimeo: import('./components/Vimeo/Vimeo.DEV'),
  VimeoBackground: import('./components/Vimeo/VimeoBackground.DEV'),
};

export const ACTIONS = Object.values(imports);
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
