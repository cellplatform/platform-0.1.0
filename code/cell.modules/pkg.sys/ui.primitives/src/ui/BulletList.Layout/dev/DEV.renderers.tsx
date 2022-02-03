import React from 'react';
import { k, css, COLORS } from '../common';
import { Card } from '../../Card';
import { SyntaxLabel } from '../../SyntaxLabel';
import { Renderers, BulletConnectorLinesProps } from '../renderers';

export type RenderCtx = {
  bulletKind: 'Lines' | 'Dot';
  bodyKind: 'Card' | 'Vanilla' | undefined;
  connectorRadius?: number;
};

/**
 * A factory that produces a function for rendering bullets
 * based on an input "type" flag.
 */
export function sampleBulletRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletItemRenderer = (e) => {
    const ctx = getCtx();
    const bulletKind = ctx.bulletKind;

    if (bulletKind === 'Lines') {
      const radius = ctx.connectorRadius;
      const props: BulletConnectorLinesProps = { ...e, radius };

      // NB: Same bullet connector with sample modification.
      if (e.index === 1 && e.total > 2 && e.kind !== 'Spacing') {
        props.borderColor = COLORS.CYAN;
      }

      return <Renderers.Bullet.ConnectorLines.Component {...props} />;
    }

    if (bulletKind === 'Dot') {
      return <Renderers.Bullet.Dot.Component {...e} />;
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
  const fn: k.BulletItemRenderer = (e) => {
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

    const elComponent = <SyntaxLabel text={'<Component>'} style={styles.component} />;

    if (bodyKind === 'Vanilla') {
      return <div {...styles.sample.vanilla}>{elComponent}</div>;
    }

    if (bodyKind === 'Card') {
      return <Card style={styles.sample.card}>{elComponent}</Card>;
    }

    // Not found.
    // return undefined; // NB: The "default" [Renderer.Body] will be used.
    return <Renderers.Body.Debug.Component {...e} minWidth={250} />;
  };

  return fn;
}
