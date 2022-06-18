import * as t from './DEV.types';

export { Icons } from '../../ui/Icons';
export { PeerNetbus } from '../../web.PeerNetbus';

export * from '../../ui/common';
export * from '../../web.PeerNetwork.events';
export * from './DEV.libs';

export { UriUtil, PeerNetwork } from '../../web.PeerNetwork';
export { t };

export const isLocalhost = location.hostname === 'localhost';
export const TARGET_NAME = 'MyTarget';
