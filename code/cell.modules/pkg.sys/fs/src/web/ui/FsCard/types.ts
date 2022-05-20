import * as t from '../../common/types';

type FilesystemId = string;
type DirectoryPath = string;

export type FsCardTheme = 'Light' | 'Dark';

export type FsCardInstance = { bus: t.EventBus<any>; id: FilesystemId };
