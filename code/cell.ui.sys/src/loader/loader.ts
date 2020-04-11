import { init } from './loader.env';

export const loader = {
  init,

  root: () => import('../components/Root'),

  // TEMP 🐷
  bar: () => import('../components/Bar'),
};
