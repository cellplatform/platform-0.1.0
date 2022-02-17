import * as t from '../../common/types';

export type NetworkCardEvent = NetworkCardPeerClickEvent;

/**
 * Events
 */
export type NetworkCardPeerClickEvent = {
  type: 'sys.net/ui.NetworkCard/PeerClick';
  payload: NetworkCardPeerClick;
};
export type NetworkCardPeerClick = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  peer: t.PeerId;
  isSelf: boolean;
  media?: MediaStream;
};
