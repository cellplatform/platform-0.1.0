import * as t from './DEV.types';

/**
 * @system
 */
export { Card } from 'sys.ui.primitives/lib/ui/Card';

/**
 * @local
 */
export * from '../common';
export * from '../NetworkCard';
export { PeerNetwork } from '../..';

export { useLocalPeer } from '../../web.hooks';
export { LocalPeerCard } from '../LocalPeerCard';
export { t };

/**
 * Constants
 */
export const VIEWS: t.DevNetworkView[] = ['URI', 'Singular', 'Collection'];
const VIEW: t.DevNetworkView = 'Collection';
const DEFAULT = { VIEW };
export const DevNetworkConstants = { VIEWS, DEFAULT };
