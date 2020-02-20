import { init } from './loader.env';

export const loader = {
  init,
  Root: () => import('./components/Root'),
  Bar: () => import('./components/Bar'),
};
