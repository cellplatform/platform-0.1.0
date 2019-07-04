/**
 * Documentation:
 *  - https://docs.mapbox.com/mapbox-gl-js/overview
 *
 * API Explorer:
 *  - https://docs.mapbox.com/api-playground/#/?_k=dmxd1m
 *
 * Manage:
 *  - https://account.mapbox.com/access-tokens
 */

import { Command, t } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root')
  .add('center-nz', e => {
    e.props.state$.next({
      center: { lng: 174, lat: -42 },
    });
  })
  .add('zoom', e => {
    const zoom = e.param<number>(0, 1);
    e.props.state$.next({ zoom });
  });
