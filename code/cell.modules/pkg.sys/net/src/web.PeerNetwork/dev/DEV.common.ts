import * as t from './DEV.types';

export { Icons } from '../../web.ui/Icons';
export { PeerNetbus } from '../../web.PeerNetbus';

export * from '../common';
export * from '../../web.PeerNetwork.events';
export * from './DEV.common.libs';

export { PeerNetwork } from '..';
export { t };

export const isLocalhost = location.hostname === 'localhost';
export const TARGET_NAME = 'MyTarget';
