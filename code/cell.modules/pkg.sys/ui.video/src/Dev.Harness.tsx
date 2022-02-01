import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  MediaStream: import('./ui/MediaStream/dev/DEV'),
  RecordButton: import('./ui/RecordButton/dev/DEV'),
  Vimeo: import('./ui/Vimeo/dev/Vimeo.DEV'),
  VimeoBackground: import('./ui/Vimeo/dev/VimeoBackground.DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  const url = new URL(location.href);
  return (
    <Harness
      bus={props.bus}
      actions={Object.values(imports)}
      initial={url.searchParams.get('dev')}
      showActions={true}
    />
  );
};

export default DevHarness;
