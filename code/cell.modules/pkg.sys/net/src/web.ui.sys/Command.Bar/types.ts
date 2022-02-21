import * as t from '../../common/types';

export type CommandBarEvent = NetworkCardCommandActionEvent;

/**
 * TODO 🐷
 * - move to primitives
 */

type InstanceId = string;

export type NetworkCardCommandActionEvent = {
  type: 'sys.net/ui.NetworkCard/CommandAction';
  payload: NetworkCardCommandAction;
};
export type NetworkCardCommandAction = {
  instance: InstanceId;
  network: t.PeerNetwork;
  text: string;
};
