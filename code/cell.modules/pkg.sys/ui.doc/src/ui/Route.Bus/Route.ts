import { QueryParams } from './Url.QueryParams';
import { RouteController as Controller } from './Route.Controller';
import { RouteEvents as Events } from './Route.Events';
import { mock } from './Route.mock';

export const RouteBus = {
  Events,
  Controller,
  QueryParams,

  /**
   * Development
   */
  Dev: { mock },
};
