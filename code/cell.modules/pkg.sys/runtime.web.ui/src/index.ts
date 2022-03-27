import { WebRuntime as Base } from 'sys.runtime.web';

import { useManifest, useModuleTarget } from './web.ui/hooks';
import { ManifestSelector, ManifestSelectorStateful } from './web.ui/Manifest.Selector';
import { ManifestSemver } from './web.ui/Manifest.Semver';
import { Module } from './web.ui/Module';
import { ModuleInfo } from './web.ui/ModuleInfo';

export const WebRuntimeUI = {
  useManifest,
  useModuleTarget,
  ManifestSelector,
  ManifestSelectorStateful,
  ManifestSemver,
  Module,
  ModuleInfo,
};

export const WebRuntime = {
  ...Base,
  ui: WebRuntimeUI,
};
