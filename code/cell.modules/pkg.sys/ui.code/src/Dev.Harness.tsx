import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  DevEnv: import('./ui/DevEnv/dev/DEV'),
  CodeEditor: import('./ui/CodeEditor/dev/DEV'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  InternalMonaco: import('./ui/Monaco/dev/DEV'),
  UnitTests: import('./Dev.UnitTests'),
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
      showActions={url.hostname === 'localhost'}
    />
  );
};

export default DevHarness;
