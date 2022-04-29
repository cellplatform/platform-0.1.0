import * as t from '../../common/types';

export * from '../common';
export * from '../Icons';

/**
 * Constants
 */
const STATE: t.AppState = {
  auth: { isOpen: true, token: '' },
  isFullscreen: false,
};

export const DEFAULT = {
  STATE,
  TOKEN: '42', // TEMP 🐷
};

export const VIDEOS: t.AppVideo[] = [
  { title: 'Acting', id: 703900635 },
  { title: 'Tribute', id: 704036152 },
  { title: 'Montage', id: 704037930, loop: true },
];
