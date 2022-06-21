import { RouteController as Controller } from './Route.Controller';
import { RouteEvents as Events } from './Route.Events';
import { QueryParams } from './QueryParams';
import { useRoute } from './Route.useRoute';
import { Dev } from './view/Dev';
import { mock } from './Route.mock';

export const Route = {
  Events,
  Controller,
  QueryParams,

  /**
   * Hooks
   */
  useRoute,

  /**
   * TODO 🐷
   *
   * with hooks:
   *    - do a stateful-redraw and "silent" (no state redraws) kind.
   *    - Like the [Keyboard] hooks.
   */

  /**
   * Development
   */
  Dev: { ...Dev, mock },
};
