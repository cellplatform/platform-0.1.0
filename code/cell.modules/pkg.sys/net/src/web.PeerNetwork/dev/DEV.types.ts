import { IStateObjectWritable } from '@platform/state.types';
import * as t from '../common/types';

export * from '../common/types';

type O = Record<string, unknown>;
export type DevModalTarget = 'fullscreen' | 'body';

/**
 * MODEL
 */
export type DevModel = { group: DevModelGroup };
export type DevModelGroup = { screens: { [key: string]: DevModelScreenSize } };
export type DevModelState = IStateObjectWritable<DevModel>;

export type DevModelScreenSizeKind = 'root';
export type DevModelScreenSize = {
  peer: t.PeerId;
  kind: 'root';
  updatedAt: number;
  size: { width: number; height: number };
};

/**
 * EVENTS
 */
export type DevEvent =
  | DevModelEvent
  | DevModalEvent
  | DevMediaModalEvent
  | DevGroupEvent
  | DevLayoutSizeEvent
  | DevImagePasteboardUriEvent;

export type DevModelEvent = DevModelGetReqEvent | DevModelGetResEvent | DevModelChangedEvent;

export type DevGroupEvent =
  | DevGroupLayoutEvent
  | DevGroupLayoutItemsChangeEvent
  | DevGroupLayoutFullscreenMediaEvent
  | DevGroupLayoutImageLoadEvent;

/**
 * Get the state model
 */
export type DevModelGetReqEvent = {
  type: 'DEV/model/get:req';
  payload: { tx: string };
};

export type DevModelGetResEvent = {
  type: 'DEV/model/get:res';
  payload: DevModelGetRes;
};
export type DevModelGetRes = { tx: string; model: DevModelState };

/**
 * Get the state model
 */
export type DevModelChangedEvent = {
  type: 'DEV/model/changed';
  payload: DevModelChanged;
};
export type DevModelChanged = { state: DevModel };

/**
 * A visual modal dialog to display.
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
export type DevMediaModal = {
  stream?: MediaStream;
  target?: DevModalTarget;
  isSelf?: boolean;
  isRecordable?: boolean;
};

/**
 * Broadcasts a display layout to peers.
 */
export type DevGroupLayoutEvent = {
  type: 'DEV/group/layout';
  payload: DevGroupLayout;
};
export type DevGroupLayout = DevGroupLayoutSimple;
export type DevGroupLayoutSimple = {
  kind: 'cards' | 'screensize' | 'video/group' | 'image/pasteboard';
  target?: DevModalTarget;
  props?: O;
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
  kind: DevModelScreenSizeKind;
  size: { width: number; height: number };
};

/**
 * Used to share [ImagePasteboard] data between peers.
 */
export type DevImagePasteboardUriEvent = {
  type: 'DEV/ImagePasteboard';
  payload: DevImagePasteboardUri;
};
export type DevImagePasteboardUri = {
  tx: string;
  action: 'paste:presend' | 'paste:send';
  data: {
    bytes: number;
    mimetype: string;
    uri?: string; // A base64 encoded CSS <image> "dataUri".
  };
};
