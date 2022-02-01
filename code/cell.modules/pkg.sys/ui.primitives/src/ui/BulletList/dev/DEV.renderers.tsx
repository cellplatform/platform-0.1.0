import React from 'react';
import { k, css, COLORS } from '../common';
import { Card } from '../../Card';
import { SyntaxLabel } from '../../SyntaxLabel';
import { Renderer, ConnectorLinesProps } from '../renderers';

export type RenderCtx = {
  bulletKind: 'Lines' | 'Dot';
  bodyKind: 'Card' | 'Vanilla';
  radius?: number; // NB: Border-radius on <ConnectorLines>.
};

/**
 * A factory that produces a function for rendering bullets
 * Produces :=>
 *              <ConnectorLines>
 */
export function connectorLinesRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletRenderer = (e) => {
    const ctx = getCtx();
    const radius = ctx.radius;
    const props: ConnectorLinesProps = { ...e, radius };

    // NB: Same bullet connector with custom modifications.
    if (e.index === 1 && e.total > 2) props.borderColor = COLORS.CYAN;

    return <Renderer.Bullet.ConnectorLines.Component {...props} />;
  };

  return fn;
}

/**
 * A factory that produces a function for rendering bullets
 * based on an input "type" flag.
 */
export function sampleBulletRendererFactory(getCtx: () => RenderCtx) {
  const fn: k.BulletRenderer = (e) => {
    const ctx = getCtx();
    const kind = ctx.bulletKind;

    if (kind === 'Lines') {
      const renderer = connectorLinesRendererFactory(getCtx);
      return renderer(e);
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
  const fn: k.BulletRenderer = (e) => {
    const ctx = getCtx();
    const kind = ctx.bodyKind;
    const is = e.is;

    const styles = {
      base: css({
        marginTop: is.vertical && !is.first && 5,
        marginBottom: is.vertical && !is.last && 5,
        marginLeft: is.horizontal && !is.first && 5,
        marginRight: is.horizontal && !is.last && 5,
      }),
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
      return <div {...css(styles.base, styles.sample.vanilla)}>{elComponent}</div>;
    }

    if (kind === 'Card') {
      return <Card style={css(styles.base, styles.sample.card)}>{elComponent}</Card>;
    }

    return <div>{`Body Renderer Not Found: "${kind}"`}</div>;
  };

  return fn;
}
