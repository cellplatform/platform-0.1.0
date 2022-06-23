import { QueryParams } from './QueryParams';
import { RouteController as Controller } from './Route.Controller';
import { RouteEvents as Events } from './Route.Events';
import { mock } from './Route.mock';
import { useRoute } from './Route.useRoute';
import { useRouteState } from './Route.useRouteState';
import { Dev } from './view/Dev';
import { RouteTable as Table } from '../Route.Table';

export const Route = {
  Events,
  Controller,
  QueryParams,
  Table,

  /**
   * Hooks
   */
  useRoute,
  useRouteState,

  /**
   * Development
   */
  Dev: { ...Dev, mock },
};
