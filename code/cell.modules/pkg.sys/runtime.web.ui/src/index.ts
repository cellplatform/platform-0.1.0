import { WebRuntime as Base } from 'sys.runtime.web';

import { useManifest, useModuleTarget } from './ui/hooks';
import { ManifestSelector, ManifestSelectorStateful } from './ui/Manifest.Selector';
import { ManifestSemver } from './ui/Manifest.Semver';
import { Module } from './ui/Module';
import { ModuleInfo } from './ui/Module.Info';

const ModuleUrl = Base.Module.Url;

export { ModuleUrl };
export const WebRuntime = {
  ...Base,

  UI: {
    useManifest,
    useModuleTarget,
    ManifestSelector,
    ManifestSelectorStateful,
    ManifestSemver,
    Module,
    ModuleInfo,
  },
};
