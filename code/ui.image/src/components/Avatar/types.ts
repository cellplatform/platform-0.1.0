export type AvatarLoadStatus = 'LOADING' | 'LOADED' | 'FAILED';

/**
 * [Events]
 */
export type AvatarEvent = IAvatarLoadEvent;

export type IAvatarLoadEvent = {
  type: 'AVATAR/load';
  payload: IAvatarLoad;
};
export type IAvatarLoad = {
  src: string;
  status: AvatarLoadStatus;
  isLoaded: boolean;
  type?: 'IMAGE' | 'PLACEHOLDER';
};
