import React from 'react';

import { Color, COLORS, List, t } from '../common';
import { Row } from './Row';

/**
 * Render the bullet of an item
 */
export const bullet: t.ListItemRenderer = (e) => {
  return (
    <List.Renderers.Bullet.ConnectorLines
      {...e}
      radius={5}
      lineWidth={2}
      lineColor={Color.alpha(COLORS.DARK, 0.15)}
    />
  );
};

/**
 * Render the body of an item.
 */
export const body: t.ListItemRenderer = (e) => {
  if (e.kind !== 'Default') return;
  const file = e.data as t.ManifestFile;
  return <Row index={e.index} file={file} is={e.is} />;
};

/**
 * Renderer set.
 */
export const renderers = { bullet, body };
