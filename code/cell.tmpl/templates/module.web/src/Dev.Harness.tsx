import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  UnitTests: import('./Dev.UnitTests'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} showActions={true} />;
};

export default DevHarness;
