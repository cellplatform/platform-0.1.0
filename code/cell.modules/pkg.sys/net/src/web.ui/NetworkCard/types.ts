import * as t from '../../common/types';

export type NetworkCardEvent =
  | NetworkCardPeerClickEvent
  | t.CommandBarEvent
  | NetworkCardCloseChildEvent;

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
  media?: MediaStream;
};

export type NetworkCardCloseChildEvent = {
  type: 'sys.net/ui.NetworkCard/CloseChild';
  payload: NetworkCardCloseChild;
};
export type NetworkCardCloseChild = {
  instance: t.InstanceId;
};
