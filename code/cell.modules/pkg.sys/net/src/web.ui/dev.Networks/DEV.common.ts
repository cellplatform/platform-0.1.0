import * as t from './DEV.types';

/**
 * @system
 */
export { Card } from 'sys.ui.primitives/lib/ui/Card';
export { MediaStream, MediaEvent, VideoStream } from 'sys.ui.video/lib/ui/MediaStream';

/**
 * @local
 */
export * from '../common';
export * from '../NetworkCard';
export { PeerNetwork } from '../..';

export { useLocalPeer } from '../../web.hooks';
export { LocalPeerCard } from '../LocalPeerCard';
export { CardBody } from '../primitives';
export { t };

/**
 * @development
 */
export { EventBridge } from '../../web.PeerNetwork/dev/DEV.event';

/**
 * Constants
 */
export const VIEWS: t.DevViewKind[] = ['URI', 'Single', 'Collection'];
const VIEW: t.DevViewKind = 'Collection';
const DEFAULT = { VIEW };
export const DevConstants = { VIEWS, DEFAULT };
