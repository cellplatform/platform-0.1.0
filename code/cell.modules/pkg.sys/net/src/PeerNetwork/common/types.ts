export * from '../../common/types';

import { Events, GroupEvents, FilesystemEvents } from '../event';
import { Controller } from '../Controller';

export type PeerNetworkController = ReturnType<typeof Controller>;
export type PeerNetworkEvents = ReturnType<typeof Events>;
export type GroupEvents = ReturnType<typeof GroupEvents>;
export type FilesystemEvents = ReturnType<typeof FilesystemEvents>;
