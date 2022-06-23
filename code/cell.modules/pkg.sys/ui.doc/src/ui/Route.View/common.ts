import { t, DEFAULT as BUS_COMMON } from '../Route.Bus/common';

export * from '../common';
export { RouteBus } from '../Route.Bus';
export { RouteTable } from '../Route.Table';

export const THEMES: t.RouteViewTheme[] = ['Light', 'Dark'];
export const DEFAULT = {
  ...BUS_COMMON,
  THEMES,
  THEME: THEMES[0],
};
