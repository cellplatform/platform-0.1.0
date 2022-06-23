import { t } from '../common';
export * from '../common';

const URL: t.RouteUrl = { href: '', path: '', hash: '', query: {} };

export const DEFAULT = {
  INSTANCE: 'singleton',
  URL,
};
