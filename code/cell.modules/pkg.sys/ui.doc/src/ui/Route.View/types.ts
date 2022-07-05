import * as t from '../../common/types';

export type RouteViewTheme = 'Light' | 'Dark';

export type RoutReadyHandler = (e: RoutReadyHandlerArgs) => void;
export type RoutReadyHandlerArgs = { route: t.RouteEvents };
