import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  MediaStream: import('./ui/MediaStream/dev/DEV'),
  RecordButton: import('./ui/RecordButton/dev/DEV'),
  Vimeo: import('./ui/Vimeo/dev/Vimeo.DEV'),
  VimeoBackground: import('./ui/Vimeo/dev/VimeoBackground.DEV'),
};

const ns = new URL(location.href).searchParams.get('ns');

export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;
