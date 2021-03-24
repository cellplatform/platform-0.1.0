import * as t from '../../common/types';

export type MediaStreamMimetype = 'video/webm';
export type MediaStreamKind = 'video' | 'screen';

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
export type MediaEvent = MediaStreamEvent | MediaStreamsEvent | MediaStreamRecordEvent;

export type MediaStreamsEvent = MediaStreamsStatusRequestEvent | MediaStreamsStatusResponseEvent;

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
  kind?: MediaStreamKind;
  constraints?: MediaStreamConstraints;
  tracks: t.MediaStreamTrack[];
};

/**
 * PLURAL Fires to retrieve the status of all streams.
 */
export type MediaStreamsStatusRequestEvent = {
  type: 'MediaStreams/status:req';
  payload: MediaStreamsStatusRequest;
};
export type MediaStreamsStatusRequest = { kind?: MediaStreamKind };

/**
 * PLURAL Fires to retrieve the status of all streams.
 */
export type MediaStreamsStatusResponseEvent = {
  type: 'MediaStreams/status:res';
  payload: MediaStreamsStatusResponse;
};
export type MediaStreamsStatusResponse = { streams: MediaStreamStatusResponse[] };

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

/**
 * Starts recording a stream.
 */
export type MediaStreamRecordStartEvent = {
  type: 'MediaStream/record/start';
  payload: MediaStreamRecordStart;
};
export type MediaStreamRecordStart = { ref: string; mimetype?: MediaStreamMimetype };

export type MediaStreamRecordStartedEvent = {
  type: 'MediaStream/record/started';
  payload: MediaStreamRecordStarteded;
};
export type MediaStreamRecordStarteded = MediaStreamRecordStart & { startedAt: number };

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
