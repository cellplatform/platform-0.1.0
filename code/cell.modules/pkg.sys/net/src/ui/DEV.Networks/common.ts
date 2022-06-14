import * as t from './DEV.types';

/**
 * @system
 */
export { Card } from 'sys.ui.primitives/lib/ui/Card';
export { MediaStream, MediaEvent, VideoStream } from 'sys.ui.video/lib/ui/MediaStream';
export { Semver } from 'sys.ui.primitives/lib/ui/Semver';

/**
 * @local
 */
export * from '../common';
export * from '../NetworkCard';
export { PeerNetwork } from '../..';

export { useLocalPeer } from '../../ui.hooks';
export { LocalPeerCard } from '../LocalPeerCard';
export { CardBody } from '../primitives';
export { t };

/**
 * @development
 */
export { EventBridge } from '../DEV.Sample/DEV.event';

/**
 * Constants
 */
export const VIEWS: t.DevViewKind[] = ['URI', 'Single', 'Collection'];
import { CHILD_KINDS } from '../NetworkCard/dev/common';

const VIEW: t.DevViewKind = 'Collection';
const DEFAULT = { VIEW };

export const DevConstants = {
  DEFAULT,
  VIEWS,
  CHILD_KINDS,
};
