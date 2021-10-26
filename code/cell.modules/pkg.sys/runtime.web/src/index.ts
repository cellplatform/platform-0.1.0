import { ManifestSelector, ManifestSelectorStateful } from './web.ui/ManifestSelector';
import { WebRuntimeBus } from './web.RuntimeBus';
import { useModuleTarget } from './web.ui/hooks';
import { Runtime } from '@platform/cell.runtime';
import { WebRuntime as PlatformWebRuntime } from '@platform/cell.runtime.web';

export { WebRuntimeBus };

export const WebRuntime = {
  module: Runtime.module(),
  remote: PlatformWebRuntime.remote,

  Bus: WebRuntimeBus,
  Ui: {
    useModuleTarget,
    ManifestSelector,
    ManifestSelectorStateful,
  },
};
