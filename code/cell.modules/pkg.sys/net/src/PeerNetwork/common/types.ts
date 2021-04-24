export * from '../../common/types';

import { Events } from '../event';
import { Controller } from '../Controller';

export type PeerNetworkEvents = ReturnType<typeof Events>;
export type PeerNetworkController = ReturnType<typeof Controller>;
