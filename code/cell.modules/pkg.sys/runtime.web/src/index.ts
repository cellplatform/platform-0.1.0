import { WebRuntimeBus } from './Web.RuntimeBus';
import { WebRuntime as Platform } from '@platform/cell.runtime.web';

export { WebRuntimeBus };
export { NetworkBusMock, NetworkBusMocks } from './mocks';

export const WebRuntime = {
  module: Platform.module,
  remote: Platform.remote,
  Bus: WebRuntimeBus,
};
