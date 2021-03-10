/**
 * Player events.
 */
export type VimeoEvent = VimeoStatusEvent | VimeoSeekEvent | VimeoPlayEvent | VimeoPauseEvent;

/**
 * Fires while video plays starts and stops.
 */
export type VimeoStatusEvent = {
  type: 'Vimeo/status';
  payload: VimeoStatus;
};
export type VimeoStatus = {
  id: string; // Instance id.
  video: number; // Vimeo id.
  kind: 'start' | 'playing' | 'pause' | 'end';
  seconds: number;
  percent: number;
  duration: number;
};

/**
 * Requests that the video moves to the given frame.
 */
export type VimeoSeekEvent = {
  type: 'Vimeo/seek';
  payload: VimeoSeek;
};
export type VimeoSeek = { id: string; seconds: number };

/**
 * Requests that the video starts playing
 */
export type VimeoPlayEvent = {
  type: 'Vimeo/play';
  payload: VimeoPlay;
};
export type VimeoPlay = { id: string };

/**
 * Requests that the video pauses.
 */
export type VimeoPauseEvent = {
  type: 'Vimeo/pause';
  payload: VimeoPause;
};
export type VimeoPause = { id: string };
