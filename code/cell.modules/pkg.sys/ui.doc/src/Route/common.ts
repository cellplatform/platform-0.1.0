import { t } from '../common';
export * from '../common';

const DUMMY_URL: t.RouteInfoUrl = { href: '', path: '', hash: '', query: {} };

export const DEFAULT = {
  INSTANCE: 'singleton',
  DUMMY_URL,
};
