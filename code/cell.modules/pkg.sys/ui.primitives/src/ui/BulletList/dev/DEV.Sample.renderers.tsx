import React from 'react';
import { k, css, COLORS } from '../common';
import { Card } from '../../Card';
import { Text } from '../../Text';
import { Renderers, BulletConnectorLinesProps } from '../renderers';

export type RenderCtx = {
  enabled: boolean;
  bulletKind: 'Lines' | 'Dot';
  bodyKind: 'Card' | 'Vanilla' | undefined;
  connectorRadius?: number;
  connectorLineWidth?: number;
  virtualScroll: boolean;
};

/**
 * A factory that produces a function for rendering bullets
 * based on an input "type" flag.
 */
export function sampleBulletRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletRenderer = (e) => {
    const ctx = getCtx();
    const bulletKind = ctx.bulletKind;

    if (bulletKind === 'Lines') {
      const radius = ctx.connectorRadius;
      const lineWidth = ctx.connectorLineWidth;
      const props: BulletConnectorLinesProps = { ...e, radius, lineWidth };

      // NB: Same bullet connector with sample modification.
      if (e.index === 1 && e.total > 2 && e.kind !== 'Spacing') {
        props.lineColor = COLORS.CYAN;
      }

      return <Renderers.Bullet.ConnectorLines {...props} />;
    }

    if (bulletKind === 'Dot') {
      return <Renderers.Bullet.Dot {...e} />;
    }

    // Not found.
    return undefined; // NB: The "default" [Renderer.Renderer] will be used.
  };

  return fn;
}

/**
 * A factory that produces a function for rendering sample body content
 * based on an input "type" flag.
 */
export function sampleBodyRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletRenderer = (e) => {
    const ctx = getCtx();
    const bodyKind = ctx.bodyKind;

    if (e.kind === 'Spacing') return null;

    const styles = {
      sample: {
        card: css({ PaddingX: 30, PaddingY: 12 }),
        vanilla: css({ PaddingX: 6, PaddingY: 2 }),
      },
      component: css({ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }),
    };

    const elComponent = <Text.Syntax text={'<Component>'} style={styles.component} />;

    if (bodyKind === 'Vanilla') {
      return <div {...styles.sample.vanilla}>{elComponent}</div>;
    }

    if (bodyKind === 'Card') {
      return <Card style={styles.sample.card}>{elComponent}</Card>;
    }

    // Not found.
    return <Renderers.Body.Default {...e} minWidth={250} />; // NB: same as returning [undefined].
  };

  return fn;
}
