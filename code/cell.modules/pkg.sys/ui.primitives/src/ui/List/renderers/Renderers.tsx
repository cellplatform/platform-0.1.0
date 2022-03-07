import React from 'react';
import { BodyRenderers as Body } from './Body';
import { BulletRenderers as Bullet } from './Bullet';
import { k } from '../common';

export const Renderers = {
  Bullet,
  Body,

  asRenderer(Component: React.FC<any>) {
    return function renderer(e: k.ListBulletRendererArgs) {
      return <Component {...e} />;
    };
  },
};
