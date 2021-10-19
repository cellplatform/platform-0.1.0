import {
  RemoteManifestSelector as ManifestSelector,
  RemoteManifestSelectorStateful as ManifestSelectorStateful,
} from './web.ui/Remote.ManifestSelector';

export { WebRuntimeBus } from './web.RuntimeBus';

export const WebRuntime = {
  Remote: {
    ManifestSelector,
    ManifestSelectorStateful,
  },
};
