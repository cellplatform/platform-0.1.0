import { WebRuntimeBus } from './Web.RuntimeBus';
import { WebRuntime as Platform } from '@platform/cell.runtime.web';
import { WebServiceWorker } from './Web.ServiceWorker';
import { ModuleUrl } from './Web.Module.Url';

export { WebRuntimeBus, ModuleUrl };
export { NetworkBusMock, NetworkBusMocks } from './mocks';

export const WebRuntime = {
  Bus: WebRuntimeBus,
  ServiceWorker: WebServiceWorker,

  Module: {
    Url: ModuleUrl,
    info: Platform.module,
    remote: Platform.remote,
  },
};
