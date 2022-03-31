import React from 'react';
import { Harness } from 'sys.ui.dev';
import { t } from './common';

const imports = {
  ModuleInfo: import('./ui/ModuleInfo/dev/DEV'),
  ManifestSelector: import('./ui/Manifest.Selector/dev/DEV'),
  ManifestSemver: import('./ui/Manifest.Semver/dev/DEV'),
  Module: import('./ui/Module/dev/DEV'),

  useManifest: import('./ui/useManifest/dev/DEV'),
  useModuleTarget: import('./ui/useModuleTarget/dev/DEV'),
  useModule: import('./ui/useModule/dev/DEV'),

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
