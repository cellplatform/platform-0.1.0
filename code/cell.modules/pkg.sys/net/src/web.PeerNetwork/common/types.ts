export * from '../../common/types';

import { GroupEvents } from '../../web.PeerNetwork.events';
import { Controller } from '../Controller';

export type PeerNetworkController = ReturnType<typeof Controller>;
export type GroupNetworkEvents = ReturnType<typeof GroupEvents>;
