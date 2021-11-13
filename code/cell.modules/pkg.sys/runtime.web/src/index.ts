import { ManifestSelector, ManifestSelectorStateful } from './web.ui/ManifestSelector';
import { WebRuntimeBus } from './web.RuntimeBus';
import { useManifest } from './web.ui/useManifest';
import { useModule } from './web.ui/useModule';
import { Runtime } from '@platform/cell.runtime';
import { WebRuntime as PlatformWebRuntime } from '@platform/cell.runtime.web';

export { WebRuntimeBus };

export const WebRuntime = {
  module: Runtime.module(),
  remote: PlatformWebRuntime.remote,

  Bus: WebRuntimeBus,

  ui: {
    useManifest,
    useModule,
    ManifestSelector,
    ManifestSelectorStateful,
  },
};
