import * as t from '../common/types';

export * from './Fs.PathList/types';

type InstanceId = string;
type FilesystemId = string;

/**
 * An UI <Component> instance.
 */
export type FsViewInstance = { bus: t.EventBus<any>; id: InstanceId; fs: FilesystemId };
