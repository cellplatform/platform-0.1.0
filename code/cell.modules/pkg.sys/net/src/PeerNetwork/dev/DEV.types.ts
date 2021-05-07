import * as t from '../common/types';

export * from '../common/types';

export type DevModalTarget = 'fullscreen' | 'body';

/**
 * EVENTS
 */
export type DevEvent = DevModalEvent | DevMediaModalEvent | DevGroupEvent | DevLayoutSizeEvent;
export type DevGroupEvent =
  | DevGroupLayoutEvent
  | DevGroupLayoutItemsChangeEvent
  | DevGroupLayoutFullscreenMediaEvent
  | DevGroupLayoutImageLoadEvent;

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
export type DevGroupLayout = {
  kind: 'cards' | 'videos' | 'crdt' | 'screensize';
  target?: DevModalTarget;
};

/**
 * Broadcast layout changes.
 */
export type DevGroupLayoutItemsChangeEvent = {
  type: 'DEV/group/layout/items/change';
  payload: DevGroupLayoutItemsChange;
};
export type DevGroupLayoutItemsChange = {
  source: t.PeerId;
  lifecycle: 'start' | 'complete';
  namespace: string;
  items: { id: string; x?: number; y?: number; scale?: number }[];
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

/**
 * Full screen media layout
 */
export type DevGroupLayoutImageLoadEvent = {
  type: 'DEV/group/image/load';
  payload: DevGroupLayoutImageLoad;
};
export type DevGroupLayoutImageLoad = {
  source: t.PeerId;
  data: ArrayBuffer;
  filename: string;
  mimetype: string;
};

/**
 * Share screen size metadata with peers.
 */
export type DevLayoutSizeEvent = {
  type: 'DEV/layout/size';
  payload: DevLayoutSize;
};
export type DevLayoutSize = {
  source: t.PeerId;
  kind: 'root';
  size: { width: number; height: number };
};
