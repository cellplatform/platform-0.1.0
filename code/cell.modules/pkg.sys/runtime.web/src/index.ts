import { ManifestSelector, ManifestSelectorStateful } from './web.ui/ManifestSelector';
import { WebRuntimeBus } from './web.RuntimeBus';
import { useModuleTarget, useManifest } from './web.ui/hooks';
import { Runtime } from '@platform/cell.runtime';
import { WebRuntime as PlatformWebRuntime } from '@platform/cell.runtime.web';
import { Module } from './web.ui/Module';
import { ModuleInfo } from './web.ui/ModuleInfo';

export { WebRuntimeBus };

export const WebRuntime = {
  module: Runtime.module(),
  remote: PlatformWebRuntime.remote,

  Bus: WebRuntimeBus,

  ui: {
    useManifest,
    useModuleTarget,
    ManifestSelector,
    ManifestSelectorStateful,
    Module,
    ModuleInfo,
  },
};
