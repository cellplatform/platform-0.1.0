import { t, IDisposable, EventBus, Observable } from './common';

type Seconds = number;
type Milliseconds = number;

/**
 * Event API.
 */
export type VimeoEventsFactory = {
  (args: { id: string; bus: EventBus<any>; isEnabled?: boolean }): VimeoEvents;
  is: VimeoEvents['is'];
};

export type VimeoEvents = IDisposable & {
  $: Observable<VimeoEvent>;
  is: { base(input: any): boolean };
  id: string; // Player instance.

  load: {
    req$: Observable<VimeoLoadReq>;
    res$: Observable<VimeoLoadRes>;
    fire(
      video: t.VimeoId,
      options?: { muted?: boolean; timeout?: Milliseconds },
    ): Promise<VimeoPlayRes>;
  };

  status: {
    $: Observable<t.VimeoStatus>;
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
  | VimeoLoadReqEvent
  | VimeoLoadResEvent
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
 * Loads a video into the player.
 */
export type VimeoLoadReqEvent = {
  type: 'Vimeo/load:req';
  payload: VimeoLoadReq;
};
export type VimeoLoadReq = { id: string; tx?: string; video: t.VimeoId; muted?: boolean };

export type VimeoLoadResEvent = {
  type: 'Vimeo/load:res';
  payload: VimeoLoadRes;
};
export type VimeoLoadRes = {
  id: string;
  tx: string;
  action: 'loaded' | 'none:already-loaded';
  status?: t.VimeoStatus;
  error?: string;
};

/**
 * Fires while video plays starts and stops.
 */
export type VimeoStatusEvent = {
  type: 'Vimeo/status';
  payload: t.VimeoStatus;
};

export type VimeoStatusReqEvent = { type: 'Vimeo/status:req'; payload: VimeoStatusReq };
export type VimeoStatusReq = { id: t.VimeoInstance; tx?: string };

export type VimeoStatusResEvent = { type: 'Vimeo/status:res'; payload: VimeoStatusRes };
export type VimeoStatusRes = {
  id: t.VimeoInstance;
  tx: string;
  status?: t.VimeoStatus;
  error?: string;
};

/**
 * Requests that the video moves to the given frame.
 */
export type VimeoSeekReqEvent = {
  type: 'Vimeo/seek:req';
  payload: VimeoSeekReq;
};
export type VimeoSeekReq = { id: t.VimeoInstance; tx?: string; seconds: Seconds };

export type VimeoSeekResEvent = {
  type: 'Vimeo/seek:res';
  payload: VimeoSeekRes;
};
export type VimeoSeekRes = { id: t.VimeoInstance; tx: string; error?: string };

/**
 * Requests that the video starts playing
 */
export type VimeoPlayReqEvent = {
  type: 'Vimeo/play:req';
  payload: VimeoPlayReq;
};
export type VimeoPlayReq = { id: t.VimeoInstance; tx?: string };

export type VimeoPlayResEvent = {
  type: 'Vimeo/play:res';
  payload: VimeoPlayRes;
};
export type VimeoPlayRes = { id: t.VimeoInstance; tx: string; error?: string };

/**
 * Requests that the video pauses.
 */
export type VimeoPauseReqEvent = {
  type: 'Vimeo/pause:req';
  payload: VimeoPauseReq;
};
export type VimeoPauseReq = { id: t.VimeoInstance; tx?: string };

export type VimeoPauseResEvent = {
  type: 'Vimeo/pause:res';
  payload: VimeoPauseRes;
};
export type VimeoPauseRes = { id: t.VimeoInstance; tx: string; error?: string };
