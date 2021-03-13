import * as t from '../../common/types';

export type MediaStreamMimetype = 'video/webm';

export type MediaStreamTrack = {
  kind: 'audio' | 'video';
  id: string;
  isEnabled: boolean;
  isMuted: boolean;
  label: string;
  state: 'live' | 'ended';
};

/**
 * EVENTS
 */
export type MediaEvent = MediaStreamEvent | MediaStreamRecordEvent;

export type MediaStreamEvent =
  | MediaStreamStatusRequestEvent
  | MediaStreamStatusResponseEvent
  | MediaStreamStartEvent
  | MediaStreamStartedEvent
  | MediaStreamStopEvent
  | MediaStreamStoppedEvent;

export type MediaStreamRecordEvent =
  | MediaStreamRecordStartEvent
  | MediaStreamRecordStartedEvent
  | MediaStreamRecordStopEvent
  | MediaStreamRecordStoppedEvent
  | MediaStreamRecordErrorEvent;

/**
 * Fires to retrieve the status of a video stream.
 */
export type MediaStreamStatusRequestEvent = {
  type: 'MediaStream/status:req';
  payload: VideoStreamStatusRequest;
};
export type VideoStreamStatusRequest = {
  ref: string;
};

/**
 * Fires to retrieve the status of a video stream.
 */
export type MediaStreamStatusResponseEvent = {
  type: 'MediaStream/status:res';
  payload: VideoStreamStatusResponse;
};
export type VideoStreamStatusResponse = {
  ref: string;
  exists: boolean;
  stream?: MediaStream;
  constraints?: MediaStreamConstraints;
  tracks: t.MediaStreamTrack[];
};

/**
 * Fires to start a [VideoStream].
 */
export type MediaStreamStartEvent = {
  type: 'MediaStream/start';
  payload: VideoStreamStart;
};
export type VideoStreamStart = {
  ref: string; // ID of the requester (so response events can be recovered).
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Fires when a [VideoStream] has started.
 */
export type MediaStreamStartedEvent = {
  type: 'MediaStream/started';
  payload: VideoStreamStarted;
};
export type VideoStreamStarted = {
  ref: string;
  stream: MediaStream;
};

/**
 * Fires to stop a VideoStream.
 */
export type MediaStreamStopEvent = {
  type: 'MediaStream/stop';
  payload: VideoStreamStop;
};
export type VideoStreamStop = { ref: string };

/**
 * Fires to [VideoStream] has stropped.
 */
export type MediaStreamStoppedEvent = {
  type: 'MediaStream/stopped';
  payload: VideoStreamStopped;
};
export type VideoStreamStopped = { ref: string; tracks: t.MediaStreamTrack[] };

/**
 * Starts recording a stream.
 */
export type MediaStreamRecordStartEvent = {
  type: 'MediaStream/record/start';
  payload: VideoStreamRecordStart;
};
export type MediaStreamRecordStartedEvent = {
  type: 'MediaStream/record/started';
  payload: VideoStreamRecordStart;
};
export type VideoStreamRecordStart = { ref: string; mimetype?: MediaStreamMimetype };

/**
 * Stops the recording of a stream.
 */
export type MediaStreamRecordStopEvent = {
  type: 'MediaStream/record/stop';
  payload: VideoStreamRecordStop;
};
export type VideoStreamRecordStop = {
  ref: string;
  download?: { filename: string };
  data?: (file: Blob) => void;
};

/**
 * Fires when a recording is stopped.
 */
export type MediaStreamRecordStoppedEvent = {
  type: 'MediaStream/record/stopped';
  payload: VideoStreamRecordStopped;
};
export type VideoStreamRecordStopped = { ref: string; file: Blob };

/**
 * Fires when an error occurs during recording.
 */
export type MediaStreamRecordErrorEvent = {
  type: 'MediaStream/record/error';
  payload: VideoStreamRecordError;
};
export type VideoStreamRecordError = { ref: string; error: string };
