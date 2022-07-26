import { HttpCache } from './Web.HttpCache';
import { Module } from './Web.Module';
import { ModuleUrl } from './Web.Module.Url';
import { WebRuntimeBus } from './Web.RuntimeBus';
import { ServiceWorker } from './Web.ServiceWorker';

export { WebRuntimeBus, ModuleUrl, HttpCache };
export { NetworkBusMock, NetworkBusMocks } from './mocks';

export const WebRuntime = {
  Bus: WebRuntimeBus,
  Module,
  HttpCache,
  ServiceWorker,
};
