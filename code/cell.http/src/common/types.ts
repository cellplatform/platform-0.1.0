export { Observable, Subject } from 'rxjs';
import { IModel } from '@platform/fsdb.types';
import * as t from '../types';

export * from '@platform/types';
export * from '@platform/fs.types';
export * from '@platform/fsdb.types';
export * from '@platform/cell.types';
export * from '@platform/http.types';
export * from '@platform/micro/lib/types';
export * from '@platform/log/lib/types';
export * from '@platform/http.router/lib/types';
export * from '@platform/cache/lib/types';

export * from '../types';

export type GetModel = () => Promise<IModel>;
export type GetUrls = () => t.IUrlMap;
