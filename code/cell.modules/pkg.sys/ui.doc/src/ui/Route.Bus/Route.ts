import { QueryParams } from './Url.QueryParams';
import { RouteController as Controller } from './Route.Controller';
import { RouteEvents as Events } from './Route.Events';
import { mock } from './Route.mock';
import { Dev } from './view/Dev';

export const RouteBus = {
  Events,
  Controller,
  QueryParams,

  /**
   * Development
   */
  Dev: { ...Dev, mock },
};
