import React from 'react';

import { k } from '../common';
import { BodyDefault } from './Body.Default';

/**
 * Body renderers.
 */
export const BodyRenderers = {
  /**
   * A  reflective {data} debug view,
   * used as the default view if no renderer is provided.
   */
  Debug: {
    Component: BodyDefault,
    render: (e: k.BulletItemArgs) => <BodyDefault {...e} />,
  },
};
