import { t } from './common';

export type MediaStreamsEvent =
  | t.MediaStreamsStatusRequestEvent
  | t.MediaStreamsStatusResponseEvent;

/**
 * PLURAL Fires to retrieve the status of all streams.
 */
export type MediaStreamsStatusRequestEvent = {
  type: 'MediaStreams/status:req';
  payload: MediaStreamsStatusRequest;
};
export type MediaStreamsStatusRequest = { kind?: t.MediaStreamKind };

/**
 * PLURAL Fires to retrieve the status of all streams.
 */
export type MediaStreamsStatusResponseEvent = {
  type: 'MediaStreams/status:res';
  payload: MediaStreamsStatusResponse;
};
export type MediaStreamsStatusResponse = { streams: t.MediaStreamStatus[] };
