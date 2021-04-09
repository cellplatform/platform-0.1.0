import { t } from './common';

export type MediaStreamRecordEvent =
  | MediaStreamRecordStartEvent
  | MediaStreamRecordStartedEvent
  | MediaStreamRecordStopEvent
  | MediaStreamRecordStoppedEvent;

/**
 * Starts recording a stream.
 */
export type MediaStreamRecordStartEvent = {
  type: 'MediaStream/record/start';
  payload: MediaStreamRecordStart;
};
export type MediaStreamRecordStart = { ref: string; mimetype?: t.MediaStreamMimetype };

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
