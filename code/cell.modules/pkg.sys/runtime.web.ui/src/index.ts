import { ManifestSelector, ManifestSelectorStateful } from './web.ui/ManifestSelector';
import { useModuleTarget, useManifest } from './web.ui/hooks';
import { Module } from './web.ui/Module';
import { ModuleInfo } from './web.ui/ModuleInfo';
import { ManifestSemver } from './web.ui/ManifestSemver';

import { WebRuntime as Base } from 'sys.runtime.web';

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
