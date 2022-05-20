import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './web/common';

const imports = {
  ModuleInfo: import('./web/ui/ModuleInfo/dev/DEV'),
  PathList: import('./web/ui/PathList/dev/DEV'),
  PathListCard: import('./web/ui/PathList.Card/dev/DEV'),
  FileDropTarget: import('./web/ui/FileDropTarget/dev/DEV'),
  UnitTests: import('./Dev.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
