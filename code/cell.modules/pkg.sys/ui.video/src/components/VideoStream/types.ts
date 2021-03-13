import * as t from '../../common/types';

export type VideoStreamMimetype = 'video/webm';

export type VideoStreamTrack = {
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
export type VideoEvent = VideoStreamEvent | VideoStreamRecordEvent;

export type VideoStreamEvent =
  | VideoStreamStatusRequestEvent
  | VideoStreamStatusResponseEvent
  | VideoStreamStartEvent
  | VideoStreamStartedEvent
  | VideoStreamStopEvent
  | VideoStreamStoppedEvent;

export type VideoStreamRecordEvent =
  | VideoStreamRecordStartEvent
  | VideoStreamRecordStartedEvent
  | VideoStreamRecordStopEvent
  | VideoStreamRecordStoppedEvent
  | VideoStreamRecordErrorEvent;

/**
 * Fires to retrieve the status of a video stream.
 */
export type VideoStreamStatusRequestEvent = {
  type: 'VideoStream/status:req';
  payload: VideoStreamStatusRequest;
};
export type VideoStreamStatusRequest = {
  ref: string;
};

/**
 * Fires to retrieve the status of a video stream.
 */
export type VideoStreamStatusResponseEvent = {
  type: 'VideoStream/status:res';
  payload: VideoStreamStatusResponse;
};
export type VideoStreamStatusResponse = {
  ref: string;
  exists: boolean;
  stream?: MediaStream;
  constraints?: MediaStreamConstraints;
  tracks: t.VideoStreamTrack[];
};

/**
 * Fires to start a [VideoStream].
 */
export type VideoStreamStartEvent = {
  type: 'VideoStream/start';
  payload: VideoStreamStart;
};
export type VideoStreamStart = {
  ref: string; // ID of the requester (so response events can be recovered).
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Fires when a [VideoStream] has started.
 */
export type VideoStreamStartedEvent = {
  type: 'VideoStream/started';
  payload: VideoStreamStarted;
};
export type VideoStreamStarted = {
  ref: string;
  stream: MediaStream;
};

/**
 * Fires to stop a VideoStream.
 */
export type VideoStreamStopEvent = {
  type: 'VideoStream/stop';
  payload: VideoStreamStop;
};
export type VideoStreamStop = { ref: string };

/**
 * Fires to [VideoStream] has stropped.
 */
export type VideoStreamStoppedEvent = {
  type: 'VideoStream/stopped';
  payload: VideoStreamStopped;
};
export type VideoStreamStopped = { ref: string; tracks: t.VideoStreamTrack[] };

/**
 * Starts recording a stream.
 */
export type VideoStreamRecordStartEvent = {
  type: 'VideoStream/record/start';
  payload: VideoStreamRecordStart;
};
export type VideoStreamRecordStartedEvent = {
  type: 'VideoStream/record/started';
  payload: VideoStreamRecordStart;
};
export type VideoStreamRecordStart = { ref: string; mimetype?: VideoStreamMimetype };

/**
 * Stops the recording of a stream.
 */
export type VideoStreamRecordStopEvent = {
  type: 'VideoStream/record/stop';
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
export type VideoStreamRecordStoppedEvent = {
  type: 'VideoStream/record/stopped';
  payload: VideoStreamRecordStopped;
};
export type VideoStreamRecordStopped = { ref: string; file: Blob };

/**
 * Fires when an error occurs during recording.
 */
export type VideoStreamRecordErrorEvent = {
  type: 'VideoStream/record/error';
  payload: VideoStreamRecordError;
};
export type VideoStreamRecordError = { ref: string; error: string };
