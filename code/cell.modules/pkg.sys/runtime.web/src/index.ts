import { ManifestSelector, ManifestSelectorStateful } from './web.ui/ManifestSelector';
import { WebRuntimeBus } from './web.RuntimeBus';
import { useModuleTarget, useManifest } from './web.ui/hooks';
import { NetworkBusMock, NetworkBusMocks } from '@platform/cell.runtime/lib/NetworkBus';
import { WebRuntime as PlatformWebRuntime } from '@platform/cell.runtime.web';
import { Module } from './web.ui/Module';
import { ModuleInfo } from './web.ui/ModuleInfo';

export { WebRuntimeBus, NetworkBusMock, NetworkBusMocks };

export const WebRuntime = {
  module: PlatformWebRuntime.module,
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
