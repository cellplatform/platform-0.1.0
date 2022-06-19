import React from 'react';

import { Color, COLORS, List, t } from '../common';
import { Row } from './Row';

const ConnectorLines = List.Renderers.Bullet.ConnectorLines;

/**
 * Render the bullet of an item
 */
export const bullet: t.ListItemRenderer = (e) => {
  const data = e.data as t.DocListItemData;
  if (!data.connectorLines) return null;

  const lineColor = Color.alpha(COLORS.DARK, 0.15);
  return <ConnectorLines {...e} radius={5} lineWidth={2} lineColor={lineColor} />;
};

/**
 * Render the body of an item.
 */
export const body: t.ListItemRenderer = (e) => {
  if (e.kind !== 'Default') return;
  const index = e.index;
  const data = e.data as t.DocListItemData;

  return <Row index={index} sizes={data.sizes} data={data} is={e.is} />;
};

/**
 * Renderer set.
 */
export const renderers = { bullet, body };
