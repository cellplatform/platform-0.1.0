import React from 'react';
import { Harness } from 'sys.ui.dev';

const imports = {
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
  PathList: import('./web.ui/PathList/dev/DEV'),
  FileDropTarget: import('./web.ui/FileDropTarget/dev/DEV'),

  FsDriverIndexedDb: import('./web.ui/FsDriver.IndexedDb/dev/DEV'),
  FsIndexedDb: import('./web.ui/FsBus.IndexedDb/dev/DEV'),
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
