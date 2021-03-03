export * from '../types';
export { BundleManifest, IHttpClientCellFileUpload } from '@platform/cell.types';
export { EventBus } from '@platform/types';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
