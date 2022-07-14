import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './web/common';

const imports = {
  FsPathList: import('./web/ui/PathList/dev/DEV'),
  FsPathListDev: import('./web/ui/PathList.Dev/dev/DEV'),
  ModuleInfo: import('./web/ui/ModuleInfo/dev/DEV'),
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
