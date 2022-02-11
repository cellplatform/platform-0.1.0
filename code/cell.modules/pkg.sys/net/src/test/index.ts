/**
 * @system
 */
export { DevActions, ObjectView, Test, expect, LocalStorage, toObject, lorem } from 'sys.ui.dev';

/**
 * @local
 */
export * from '../common';
export { PeerNetwork } from '../web.PeerNetwork';

/**
 * Constants
 */
export const TEST = {
  SIGNAL: 'rtc.cellfs.com', // WebRTC "signal server" connection coordination end-point.
};
