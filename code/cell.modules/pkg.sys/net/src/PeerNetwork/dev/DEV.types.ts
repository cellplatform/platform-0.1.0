export * from '../common/types';

export type DevModalTarget = 'fullscreen' | 'body';

/**
 * EVENTS
 */
export type DevEvent = DevModalEvent | DevMediaModalEvent | DevGroupLayoutEvent;

/**
 * A modal to display.
 */
export type DevModalEvent = {
  type: 'DEV/modal';
  payload: DevModal;
};
export type DevModal = { el?: JSX.Element; target?: DevModalTarget };

/**
 * Targets a MediaStream into a fullscreen modal.
 */
export type DevMediaModalEvent = {
  type: 'DEV/media/modal';
  payload: DevMediaModal;
};
export type DevMediaModal = { stream?: MediaStream; target?: DevModalTarget };

/**
 * Broadcasts a display layout to peers.
 */
export type DevGroupLayoutEvent = {
  type: 'DEV/group/layout';
  payload: DevGroupLayout;
};
export type DevGroupLayout = DevGroupLayoutCards | DevGroupLayoutVideos;
export type DevGroupLayoutCards = {
  kind: 'cards';
};
export type DevGroupLayoutVideos = {
  kind: 'videos';
};
