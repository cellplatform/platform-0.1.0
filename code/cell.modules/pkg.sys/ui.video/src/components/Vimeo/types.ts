import { Observable } from 'rxjs';
import { IDisposable, EventBus } from '@platform/types';

type Seconds = number;
type Milliseconds = number;

/**
 * Event API.
 */
export type VimeoEventsFactory = {
  (args: { id: string; bus: EventBus<any> }): VimeoEvents;
  is: VimeoEvents['is'];
};

export type VimeoEvents = IDisposable & {
  $: Observable<VimeoEvent>;
  is: { base(input: any): boolean };
  id: string; // Player instance.

  status: {
    $: Observable<VimeoStatus>;
    req$: Observable<VimeoStatusReq>;
    res$: Observable<VimeoStatusRes>;
    get(options?: { timeout?: Milliseconds }): Promise<VimeoStatusRes>;
  };

  play: {
    req$: Observable<VimeoPlayReq>;
    res$: Observable<VimeoPlayRes>;
    fire(options?: { timeout?: Milliseconds }): Promise<VimeoPlayRes>;
  };

  pause: {
    req$: Observable<VimeoPauseReq>;
    res$: Observable<VimeoPauseRes>;
    fire(options?: { timeout?: Milliseconds }): Promise<VimeoPauseRes>;
  };

  seek: {
    req$: Observable<VimeoSeekReq>;
    res$: Observable<VimeoSeekRes>;
    fire(seconds: Seconds, options?: { timeout?: Milliseconds }): Promise<VimeoSeekRes>;
  };
};

/**
 * Events
 */
export type VimeoEvent =
  | VimeoStatusEvent
  | VimeoStatusReqEvent
  | VimeoStatusResEvent
  | VimeoPlayReqEvent
  | VimeoPlayResEvent
  | VimeoPauseReqEvent
  | VimeoPauseResEvent
  | VimeoSeekReqEvent
  | VimeoSeekResEvent;

/**
 * Fires while video plays starts and stops.
 */
export type VimeoStatusEvent = {
  type: 'Vimeo/status';
  payload: VimeoStatus;
};
export type VimeoStatus = {
  id: string; // Player instance.
  video: number; // Vimeo identifier.
  kind: 'loaded' | 'start' | 'update' | 'seek' | 'stop' | 'end';
  duration: Seconds;
  seconds: Seconds;
  percent: number;
  playing: boolean;
  ended: boolean;
};

export type VimeoStatusReqEvent = { type: 'Vimeo/status:req'; payload: VimeoStatusReq };
export type VimeoStatusReq = { id: string; tx?: string };

export type VimeoStatusResEvent = { type: 'Vimeo/status:res'; payload: VimeoStatusRes };
export type VimeoStatusRes = { id: string; tx: string; status?: VimeoStatus; error?: string };

/**
 * Requests that the video moves to the given frame.
 */
export type VimeoSeekReqEvent = {
  type: 'Vimeo/seek:req';
  payload: VimeoSeekReq;
};
export type VimeoSeekReq = { id: string; tx?: string; seconds: Seconds };

export type VimeoSeekResEvent = {
  type: 'Vimeo/seek:res';
  payload: VimeoSeekRes;
};
export type VimeoSeekRes = { id: string; tx: string; error?: string };

/**
 * Requests that the video starts playing
 */
export type VimeoPlayReqEvent = {
  type: 'Vimeo/play:req';
  payload: VimeoPlayReq;
};
export type VimeoPlayReq = { id: string; tx?: string };

export type VimeoPlayResEvent = {
  type: 'Vimeo/play:res';
  payload: VimeoPlayRes;
};
export type VimeoPlayRes = { id: string; tx: string; error?: string };

/**
 * Requests that the video pauses.
 */
export type VimeoPauseReqEvent = {
  type: 'Vimeo/pause:req';
  payload: VimeoPauseReq;
};
export type VimeoPauseReq = { id: string; tx?: string };

export type VimeoPauseResEvent = {
  type: 'Vimeo/pause:res';
  payload: VimeoPauseRes;
};
export type VimeoPauseRes = { id: string; tx: string; error?: string };
