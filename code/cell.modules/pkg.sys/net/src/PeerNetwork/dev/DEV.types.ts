export * from '../common/types';

export type DevEvent = DevMediaFullScreenEvent;

/**
 * Events
 */

export type DevMediaFullScreenEvent = {
  type: 'DEV/media/fullscreen';
  payload: DevMediaFullScreen;
};
export type DevMediaFullScreen = {
  stream?: MediaStream;
};
