import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  UnitTests: import('./web.ui/dev/DEV.UnitTests'),
  ModuleInfo: import('./web.ui/ModuleInfo/dev/DEV'),
};

/**
 * UI Harness (Dev)
 */
type Props = { bus?: t.EventBus };

export const DevHarness: React.FC<Props> = (props) => {
  const url = new URL(location.href);
  const dev = url.searchParams.get('dev');
  const actions = Object.values(imports);
  return <Harness bus={props.bus} actions={actions} initial={dev} />;
};

export default DevHarness;
