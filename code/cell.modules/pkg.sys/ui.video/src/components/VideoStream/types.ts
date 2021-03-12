import * as t from '../../common/types';

export type VideoEvent = VideoStreamEvent;
export type VideoStreamEvent = VideoStreamGetMediaEvent | VideoStreamMediaEvent;

/**
 * Request to connect to the users camera/audio.
 */
export type VideoStreamGetMediaEvent = {
  type: 'VideoStream/getMedia';
  payload: VideoStreamGetMedia;
};
export type VideoStreamGetMedia = {
  ref: string; // ID of the requester (so response events can be recovered).
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * A stream of media.
 */
export type VideoStreamMediaEvent = {
  type: 'VideoStream/media';
  payload: VideoStreamMedia;
};
export type VideoStreamMedia = {
  ref: string;
  stream: MediaStream;
};
