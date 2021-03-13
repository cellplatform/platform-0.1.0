import * as t from '../../common/types';

export type VideoStreamMimetype = 'video/webm';

export type VideoEvent = VideoStreamEvent | VideoStreamRecordEvent;
export type VideoStreamEvent = VideoStreamGetEvent | VideoStreamCreatedEvent;
export type VideoStreamRecordEvent =
  | VideoStreamRecordStartEvent
  | VideoStreamRecordStartedEvent
  | VideoStreamRecordStopEvent
  | VideoStreamRecordStoppedEvent
  | VideoStreamRecordErrorEvent;

/**
 * Request to connect to the users camera/audio.
 */
export type VideoStreamGetEvent = {
  type: 'VideoStream/get';
  payload: VideoStreamGet;
};
export type VideoStreamGet = {
  ref: string; // ID of the requester (so response events can be recovered).
  constraints?: t.PartialDeep<MediaStreamConstraints>;
};

/**
 * A stream of media.
 */
export type VideoStreamCreatedEvent = {
  type: 'VideoStream/created';
  payload: VideoStreamCreated;
};
export type VideoStreamCreated = {
  ref: string;
  stream: MediaStream;
};

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
