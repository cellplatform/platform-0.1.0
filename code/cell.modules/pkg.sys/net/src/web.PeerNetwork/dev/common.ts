import * as t from './DEV.types';

export { Icons } from '../../web.ui/Icons';
export { PeerNetbus as PeerNetworkBus } from '../../web.PeerNetbus';

export * from './common.libs';
export * from '../common';

export { PeerNetwork } from '..';

export { t };

export const isLocalhost = location.hostname === 'localhost';

export const TARGET_NAME = 'MyTarget';
