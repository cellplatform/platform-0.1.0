import React from 'react';

import { k } from '../common';
import { BulletConnectorLines } from './Bullet.ConnectorLines';
import { BulletDot } from './Bullet.Dot';

/**
 * Bullet renderers
 */
export const BulletRenderers = {
  /**
   * Connection lines between nodes.
   */
  ConnectorLines: {
    Component: BulletConnectorLines,
    render: (e: k.BulletItemProps) => <BulletConnectorLines {...e} />,
  },

  /**
   * A simple [dot] as a bullet
   */
  Dot: {
    Component: BulletDot,
    render: (e: k.BulletItemProps) => <BulletDot {...e} />,
  },
};
