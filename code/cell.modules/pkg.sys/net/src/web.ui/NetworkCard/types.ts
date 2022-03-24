import * as t from '../../common/types';

export type NetworkCardEvent =
  | NetworkCardPeerClickEvent
  | NetworkCardCloseChildEvent
  | NetworkCardOverlayEvent;

/**
 * Events
 */
export type NetworkCardPeerClickEvent = {
  type: 'sys.net/ui.NetworkCard/PeerClick';
  payload: NetworkCardPeerClick;
};
export type NetworkCardPeerClick = {
  instance: t.Id;
  network: t.PeerNetwork;
  peer: t.PeerId;
  media?: MediaStream;
};

export type NetworkCardCloseChildEvent = {
  type: 'sys.net/ui.NetworkCard/CloseChild';
  payload: NetworkCardCloseChild;
};
export type NetworkCardCloseChild = { instance: t.Id };

/**
 * Modal overlay
 */
export type NetworkCardOverlayEvent = {
  type: 'sys.net/ui.NetworkCard/Overlay';
  payload: NetworkCardOverlay;
};
export type NetworkCardOverlay = {
  instance: t.Id;
  render?(props: { size: t.DomRect }): JSX.Element | null;
};
