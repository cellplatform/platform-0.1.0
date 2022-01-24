export * from '../../common/types';

import { PeerEvents, GroupEvents } from '../event';
import { Controller } from '../Controller';

export type PeerNetworkController = ReturnType<typeof Controller>;
export type PeerNetworkEvents = ReturnType<typeof PeerEvents>;
export type GroupEvents = ReturnType<typeof GroupEvents>;
