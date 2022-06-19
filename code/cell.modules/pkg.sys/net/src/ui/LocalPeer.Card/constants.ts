import * as k from './types';

/**
 * Complete list of fields.
 */
export const FIELDS: k.LocalPeerCardFields[] = [
  'PeerId',
  'SignalServer',
  'Lifetime',
  'Connections.Count',
  'Connection.Open',
];

/**
 * Default fields and order.
 */
const DEFAULT_FIELDS: k.LocalPeerCardFields[] = [
  'PeerId',
  'SignalServer',
  'Lifetime',
  'Connections.Count',
  'Connection.Open',
];

export const DEFAULT = {
  FIELDS: DEFAULT_FIELDS,
};
