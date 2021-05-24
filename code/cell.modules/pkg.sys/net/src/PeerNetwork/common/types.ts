export * from '../../common/types';

import { PeerEvents, GroupEvents, FilesystemEvents } from '../event';
import { Controller } from '../Controller';

export type PeerNetworkController = ReturnType<typeof Controller>;
export type PeerNetworkEvents = ReturnType<typeof PeerEvents>;
export type GroupEvents = ReturnType<typeof GroupEvents>;
export type FilesystemEvents = ReturnType<typeof FilesystemEvents>;
