import React from 'react';
import { BodyRenderers as Body } from './Body';
import { BulletRenderers as Bullet } from './Bullet';
import { t } from '../common';

export const Renderers = {
  Bullet,
  Body,

  /**
   * Wrap a component within a "renderer" signature function.
   */
  asRenderer(Component: React.FC<any>) {
    return function renderer(e: t.ListBulletRendererArgs) {
      return <Component {...e} />;
    };
  },
};
