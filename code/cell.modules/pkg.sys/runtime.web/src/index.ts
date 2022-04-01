import { WebRuntimeBus } from './web.RuntimeBus';
import { NetworkBusMock, NetworkBusMocks } from '@platform/cell.runtime/lib/NetworkBus';
import { WebRuntime as PlatformWebRuntime } from '@platform/cell.runtime.web';

export { WebRuntimeBus, NetworkBusMock, NetworkBusMocks };

export const WebRuntime = {
  module: PlatformWebRuntime.module,
  remote: PlatformWebRuntime.remote,
  Bus: WebRuntimeBus,
};
