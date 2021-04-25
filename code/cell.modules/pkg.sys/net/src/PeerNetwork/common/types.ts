export * from '../../common/types';

import { Events, GroupEvents } from '../event';
import { Controller } from '../Controller';

export type PeerNetworkController = ReturnType<typeof Controller>;
export type PeerNetworkEvents = ReturnType<typeof Events>;
export type GroupEvents = ReturnType<typeof GroupEvents>;
