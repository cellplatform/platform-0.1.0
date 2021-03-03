export * from '../types';
export { BundleManifest } from '@platform/cell.types';
export { EventBus } from '@platform/types';

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
