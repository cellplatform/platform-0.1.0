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
  | MediaStreamStartVideoEvent
  | MediaStreamStartScreenEvent
  | MediaStreamStartedEvent
  | MediaStreamStopEvent
  | MediaStreamStoppedEvent
  | MediaStreamErrorEvent;

export type MediaStreamRecordEvent =
  | MediaStreamRecordStartEvent
  | MediaStreamRecordStartedEvent
  | MediaStreamRecordStopEvent
  | MediaStreamRecordStoppedEvent;

/**
 * Fires to retrieve the status of a video stream.
 */
export type MediaStreamStatusRequestEvent = {
  type: 'MediaStream/status:req';
  payload: MediaStreamStatusRequest;
};
export type MediaStreamStatusRequest = {
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
export type MediaStreamStartVideoEvent = {
  type: 'MediaStream/start:video';
  payload: VideoStreamStartVideo;
};
export type VideoStreamStartVideo = {
  ref: string; // ID of the requester.
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * Fires to start a Screen capture stream.
 */
export type MediaStreamStartScreenEvent = {
  type: 'MediaStream/start:screen';
  payload: VideoStreamStartScreen;
};
export type VideoStreamStartScreen = {
  ref: string; // ID of the requester.
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

/**
 * Starts recording a stream.
 */
export type MediaStreamRecordStartEvent = {
  type: 'MediaStream/record/start';
  payload: VideoStreamRecordStart;
};
export type VideoStreamRecordStart = { ref: string; mimetype?: MediaStreamMimetype };

export type MediaStreamRecordStartedEvent = {
  type: 'MediaStream/record/started';
  payload: MediaStreamRecordStarteded;
};
export type MediaStreamRecordStarteded = VideoStreamRecordStart & { startedAt: number };

/**
 * Stops the recording of a stream.
 */
export type MediaStreamRecordStopEvent = {
  type: 'MediaStream/record/stop';
  payload: MediaStreamRecordStop;
};
export type MediaStreamRecordStop = {
  ref: string;
  download?: { filename: string };
  data?: (file: Blob) => void;
};

/**
 * Fires when a recording is stopped.
 */
export type MediaStreamRecordStoppedEvent = {
  type: 'MediaStream/record/stopped';
  payload: MediaStreamRecordStopped;
};
export type MediaStreamRecordStopped = { ref: string; file: Blob };
