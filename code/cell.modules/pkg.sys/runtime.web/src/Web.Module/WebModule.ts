import { WebRuntime as Platform } from '@platform/cell.runtime.web';
import { ModuleUrl as Url } from '../Web.Module.Url';

export const Module = {
  info: Platform.module,
  remote: Platform.remote,
  Url,
};
