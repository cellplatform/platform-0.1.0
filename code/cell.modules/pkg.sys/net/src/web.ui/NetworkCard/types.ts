import * as t from '../../common/types';

export type NetworkCardEvent = NetworkCardPeerClickEvent | NetworkCardCommandActionEvent;

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

export type NetworkCardCommandActionEvent = {
  type: 'sys.net/ui.NetworkCard/CommandAction';
  payload: NetworkCardCommandAction;
};
export type NetworkCardCommandAction = {
  instance: t.InstanceId;
  network: t.PeerNetwork;
  text: string;
};
