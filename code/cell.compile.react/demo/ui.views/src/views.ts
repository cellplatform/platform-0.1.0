import { t } from './common';

export const VIEWS: t.View[] = [
  { name: 'invite 1', load: () => import('./components/Invite') as any },
  { name: 'invite 2', load: () => import('./components/Invite') },
];
