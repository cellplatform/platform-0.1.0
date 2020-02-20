import './loader.env';

export const loader = {
  Root: () => import('./components/Root'),
  Bar: () => import('./components/Bar'),
};
