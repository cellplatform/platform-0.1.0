import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  CodeEditor: import('./ui/CodeEditor/dev/DEV'),
  DevEnv: import('./ui/DevEnv/dev/DEV'),
  InternalMonaco: import('./ui/Monaco/dev/DEV'),
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  UnitTestsEditor: import('./test/Editor.UnitTests/DEV'),
  UnitTests: import('./Dev.UnitTests'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  return <Harness bus={props.bus} actions={Object.values(imports)} />;
};

export default DevHarness;
