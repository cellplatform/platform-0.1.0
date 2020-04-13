import { init } from './loader.env';

export const loader = {
  init,
  root: () => import('../components/Root'),
};
