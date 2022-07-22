import { WebRuntimeBus } from './Web.RuntimeBus';
import { WebRuntime as Platform } from '@platform/cell.runtime.web';
import { WebServiceWorker as ServiceWorker } from './Web.ServiceWorker';
import { ModuleUrl } from './Web.Module.Url';

export { WebRuntimeBus };
export { NetworkBusMock, NetworkBusMocks } from './mocks';
export { ModuleUrl };

export const WebRuntime = {
  module: Platform.module,
  remote: Platform.remote,
  Bus: WebRuntimeBus,
  ServiceWorker,

  Module: {
    Url: ModuleUrl,
  },
};
