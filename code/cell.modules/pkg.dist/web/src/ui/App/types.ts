import * as t from '../../common/types';

type Id = string;
type VideoId = number;

export type AppInstance = { bus: t.EventBus<any>; id: string };

/**
 * STATE
 */
export type AppState = {
  isFullscreen: boolean;
  auth: { isOpen: boolean; token: string };
  video?: AppVideo;
};

export type AppVideo = {
  title: string;
  id: VideoId;
  loop?: boolean;
};

/**
 * EVENTS (API)
 */
export type AppEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  state: t.JsonState<AppState>;
  login(): Promise<boolean>;
  fullscreen(enter: boolean): void;
  video: {
    show(video: AppVideo): void;
    hide(): void;
    player: t.VimeoEvents;
  };
};
