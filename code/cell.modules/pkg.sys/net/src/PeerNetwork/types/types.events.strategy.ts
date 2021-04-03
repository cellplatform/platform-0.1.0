import { t } from './common';

/**
 * NOTE: These events are fired over the "network bus" to
 *       other connected clients.
 */
export type StrategyEvent = StrategyEnsureConnectedEvent;

/**
 * Broadcasts to peers a set of connections they should ensure
 * they are connected to.
 */
export type StrategyEnsureConnectedEvent = {
  type: 'NetworkStrategy/ensureConnected';
  payload: StrategyEnsureConnected;
};
export type StrategyEnsureConnected = {
  peers: t.PeerId[];
  isReliable: boolean;
  metadata?: t.JsonMap;
};
