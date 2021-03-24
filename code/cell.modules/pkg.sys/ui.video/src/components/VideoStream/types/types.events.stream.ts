import { t } from './common';

export type MediaStreamEvent =
  | MediaStreamStatusRequestEvent
  | MediaStreamStatusResponseEvent
  | MediaStreamStartVideoEvent
  | MediaStreamStartScreenEvent
  | MediaStreamStartedEvent
  | MediaStreamStopEvent
  | MediaStreamStoppedEvent
  | MediaStreamErrorEvent;

/**
 * Fires to retrieve the status of a media stream.
 */
export type MediaStreamStatusRequestEvent = {
  type: 'MediaStream/status:req';
  payload: MediaStreamStatusRequest;
};
export type MediaStreamStatusRequest = { ref: string };

/**
 * Fires to retrieve the status of a media stream.
 */
export type MediaStreamStatusResponseEvent = {
  type: 'MediaStream/status:res';
  payload: MediaStreamStatusResponse;
};
export type MediaStreamStatusResponse = {
  ref: string;
  exists: boolean;
  stream?: MediaStream;
  kind?: t.MediaStreamKind;
  constraints?: MediaStreamConstraints;
  tracks: t.MediaStreamTrack[];
};

/**
 * Fires to start a [MediaStream].
 */
export type MediaStreamStartVideoEvent = {
  type: 'MediaStream/start:video';
  payload: MediaStreamStartVideo;
};
export type MediaStreamStartVideo = {
  ref: string; // ID of the requester.
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Fires to start a Screen capture stream.
 */
export type MediaStreamStartScreenEvent = {
  type: 'MediaStream/start:screen';
  payload: MediaStreamStartScreen;
};
export type MediaStreamStartScreen = {
  ref: string; // ID of the requester.
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Fires when a [MediaStream] has started.
 */
export type MediaStreamStartedEvent = {
  type: 'MediaStream/started';
  payload: MediaStreamStarted;
};
export type MediaStreamStarted = { ref: string; stream: MediaStream };

/**
 * Fires to stop a MediaStream.
 */
export type MediaStreamStopEvent = {
  type: 'MediaStream/stop';
  payload: MediaStreamStop;
};
export type MediaStreamStop = { ref: string };

/**
 * Fires to [MediaStream] has stropped.
 */
export type MediaStreamStoppedEvent = {
  type: 'MediaStream/stopped';
  payload: MediaStreamStopped;
};
export type MediaStreamStopped = { ref: string; tracks: t.MediaStreamTrack[] };

/**
 * Fires when an error occurs during recording.
 */
export type MediaStreamErrorEvent = {
  type: 'MediaStream/error';
  payload: MediaStreamError;
};
export type MediaStreamError = {
  ref: string;
  kind: 'stream:error' | 'record:error';
  error: string;
};

/**
 * RECORD
 */
