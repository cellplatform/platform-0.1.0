import React from 'react';
import { k, css, COLORS } from '../common';
import { Card } from '../../Card';
import { SyntaxLabel } from '../../SyntaxLabel';
import { Renderer, BulletConnectorLinesProps } from '../renderers';

export type RenderCtx = {
  bulletKind: 'Lines' | 'Dot';
  bodyKind: 'Card' | 'Vanilla';
  connectorRadius?: number;
};

/**
 * A factory that produces a function for rendering bullets
 * based on an input "type" flag.
 */
export function sampleBulletRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletItemRenderer = (e) => {
    const ctx = getCtx();
    const kind = ctx.bulletKind;

    if (kind === 'Lines') {
      const radius = ctx.connectorRadius;
      const props: BulletConnectorLinesProps = { ...e, radius };

      // NB: Same bullet connector with sample modification.
      if (e.index === 1 && e.total > 2 && e.kind !== 'Spacing') {
        props.borderColor = COLORS.CYAN;
      }

      return <Renderer.Bullet.ConnectorLines.Component {...props} />;
    }

    if (kind === 'Dot') {
      return <Renderer.Bullet.Dot.Component {...e} />;
    }

    return <div>{`Bullet Renderer Not Found: "${ctx.bulletKind}"`}</div>;
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
    const kind = ctx.bodyKind;

    if (e.kind === 'Spacing') return null;

    const styles = {
      sample: {
        card: css({ PaddingX: 30, PaddingY: 12 }),
        vanilla: css({ PaddingX: 6 }),
      },
      component: css({
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: 16,
      }),
    };

    const elComponent = <SyntaxLabel text={'<Component>'} style={styles.component} />;

    if (kind === 'Vanilla') {
      return <div {...styles.sample.vanilla}>{elComponent}</div>;
    }

    if (kind === 'Card') {
      return <Card style={styles.sample.card}>{elComponent}</Card>;
    }

    return <div>{`Body Renderer Not Found: "${kind}"`}</div>;
  };

  return fn;
}
