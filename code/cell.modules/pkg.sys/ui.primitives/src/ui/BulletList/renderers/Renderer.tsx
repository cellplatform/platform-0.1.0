import React from 'react';

import { k } from '../common';
import { Debug, DebugProps } from './Body.Debug';
import { BulletConnectorLines, BulletConnectorLinesProps } from './Bullet.ConnectorLines';
import { BulletDot, BulletDotProps } from './Bullet.Dot';

export {
  BulletConnectorLinesProps as ConnectorLinesProps,
  DebugProps as DefaultDebugProps,
  BulletDotProps,
};

const BodyDebug = {
  Component: Debug,
  render: (e: k.BulletProps) => <Debug {...e} />,
};

export const Renderer = {
  /**
   * Bullet renderers
   */
  Bullet: {
    /**
     * Connection lines between nodes.
     */
    ConnectorLines: {
      Component: BulletConnectorLines,
      render: (e: k.BulletProps) => <BulletConnectorLines {...e} />,
    },

    /**
     * A simple [dot] as a bullet
     */
    Dot: {
      Component: BulletDot,
      render: (e: k.BulletProps) => <BulletDot {...e} />,
    },
  },

  /**
   * Body renderers.
   */
  Body: {
    Default: BodyDebug,

    /**
     * A  reflective {data} debug view.
     */
    Debug: BodyDebug,
  },
};
