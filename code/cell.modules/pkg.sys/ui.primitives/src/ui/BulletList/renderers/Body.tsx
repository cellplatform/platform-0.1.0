import React from 'react';

import { k } from '../common';
import { Debug } from './Body.Debug';

/**
 * Body renderers.
 */
export const BodyRenderers = {
  /**
   * A  reflective {data} debug view,
   * used as the default view if no renderer is provided.
   */
  Debug: {
    Component: Debug,
    render: (e: k.BulletItemProps) => <Debug {...e} />,
  },
};
