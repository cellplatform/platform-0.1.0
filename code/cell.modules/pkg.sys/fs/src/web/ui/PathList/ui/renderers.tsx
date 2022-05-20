import React from 'react';

import { Color, COLORS, List, t } from '../common';
import { Row } from './PathList.Row';

const ConnectorLines = List.Renderers.Bullet.ConnectorLines;

/**
 * Render the bullet of an item
 */
export const bullet: t.ListItemRenderer = (e) => {
  const data = e.data as t.PathListItemData;
  const { theme } = data;
  const lineColor = theme === 'Light' ? Color.alpha(COLORS.DARK, 0.15) : 0.3;
  return <ConnectorLines {...e} radius={5} lineWidth={2} lineColor={lineColor} />;
};

/**
 * Render the body of an item.
 */
export const body: t.ListItemRenderer = (e) => {
  if (e.kind !== 'Default') return;
  const data = e.data as t.PathListItemData;
  const { file, theme } = data;
  return <Row index={e.index} theme={theme} file={file} is={e.is} />;
};

/**
 * Renderer set.
 */
export const renderers = { bullet, body };
