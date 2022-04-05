import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './web/common';

const imports = {
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  PathList: import('./ui/PathList/dev/DEV'),
  FileDropTarget: import('./ui/FileDropTarget/dev/DEV'),
  FsDriverIndexedDb: import('./ui/FsDriver.IndexedDb/dev/DEV'),
  FsIndexedDb: import('./ui/FsBus.IndexedDb/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
