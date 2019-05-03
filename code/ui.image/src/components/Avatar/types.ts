export type AvatarLoadStatus = 'LOADING' | 'LOADED' | 'LOAD_FAILED';

/**
 * [Events]
 */
export type AvatarEvent = IAvatarLoadEvent;

export type IAvatarLoadEvent = {
  type: 'AVATAR/load';
  payload: {
    src: string;
    status: AvatarLoadStatus;
    type?: 'IMAGE' | 'PLACEHOLDER';
  };
};
