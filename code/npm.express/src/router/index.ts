import { express, t } from '../common';
import * as run from './routes.run';
import * as status from './routes.status';
import * as update from './routes.update';

export * from './types';

/**
 * Creates an Express middleware router for
 *   - installing
 *   - updating
 *   - starting
 *   - stopping
 * a node-module service.
 */
export function create(args: { getContext: t.GetNpmRouteContext }) {
  return express
    .Router()
    .use(update.create(args))
    .use(run.create(args))
    .use(status.create(args));
}
