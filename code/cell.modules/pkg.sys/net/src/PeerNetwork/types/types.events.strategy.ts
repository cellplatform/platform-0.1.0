import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type StrategyEvent = StrategyEnsureConnectedDataEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type StrategyEnsureConnectedDataEvent = {
  type: 'NetworkStrategy/ensureConnected:data';
  payload: StrategyEnsureConnectedData;
};
export type StrategyEnsureConnectedData = {
  peers: t.PeerId[];
  isReliable: boolean;
  metadata?: t.JsonMap;
};
