import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  MediaStream: import('./components/MediaStream/dev/DEV'),
  RecordButton: import('./components/RecordButton/dev/DEV'),
  Vimeo: import('./components/Vimeo/dev/Vimeo.DEV'),
  VimeoBackground: import('./components/Vimeo/dev/VimeoBackground.DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
