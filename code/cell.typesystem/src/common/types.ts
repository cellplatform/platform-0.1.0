export { Subject } from 'rxjs';
export { IMemoryCache } from '@platform/cache/lib/types';
export { IFs } from '@platform/fs.types';
export { Json } from '@platform/types';

export * from '@platform/cell.types';
export * from '../types';

export type IPackage = {
  name: string;
  version: string;
  dependencies?: { [key: string]: string };
};
