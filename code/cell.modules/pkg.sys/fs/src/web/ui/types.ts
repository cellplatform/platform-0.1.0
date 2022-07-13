import * as t from '../common/types';

export * from './ModuleInfo/types';
export * from './PathList/types';

type InstanceId = string;
type FilesystemId = string;

/**
 * An UI <Component> instance.
 */
export type FsViewInstance = { bus: t.EventBus<any>; id: InstanceId; fs: FilesystemId };
