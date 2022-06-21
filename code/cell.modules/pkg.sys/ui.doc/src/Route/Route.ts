import { RouteController as Controller } from './Route.Controller';
import { RouteEvents as Events } from './Route.Events';
import { Location } from './Location';
import { useRoute } from './Route.useRoute';
import { Dev } from './view/Dev';

export const Route = {
  Events,
  Controller,
  Location,

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
  Dev: {
    ...Dev,
  },
  mock(href?: string) {
    const location = Location(href ?? 'https://domain.com/mock');

    const pushState = (data: any, _unused: string, url?: string) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
      if (url) location.href = url;
    };
    return { location, pushState };
  },
};
