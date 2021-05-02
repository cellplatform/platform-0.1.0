import * as t from '../common/types';

export * from '../common/types';

export type DevModalTarget = 'fullscreen' | 'body';

/**
 * EVENTS
 */
export type DevEvent = DevModalEvent | DevMediaModalEvent | DevGroupEvent;
export type DevGroupEvent =
  | DevGroupLayoutEvent
  | DevGroupLayoutItemsMoveEvent
  | DevGroupLayoutFullscreenMediaEvent;

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

/**
 * Broadcast layout changes.
 */
export type DevGroupLayoutItemsMoveEvent = {
  type: 'DEV/group/layout/items/move';
  payload: DevGroupLayoutItemsMove;
};
export type DevGroupLayoutItemsMove = {
  source: t.PeerId;
  lifecycle: 'start' | 'complete';
  items: { id: string; x: number; y: number }[];
};

/**
 * Full screen media layout
 */
export type DevGroupLayoutFullscreenMediaEvent = {
  type: 'DEV/group/layout/fullscreenMedia';
  payload: DevGroupLayoutFullscreenMedia;
};
export type DevGroupLayoutFullscreenMedia = {
  source: t.PeerId;
  media?: { id: string };
};
