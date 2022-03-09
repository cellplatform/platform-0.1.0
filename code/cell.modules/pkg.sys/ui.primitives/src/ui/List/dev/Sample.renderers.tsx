import React from 'react';
import { color, t, css, COLORS } from '../common';
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
export function sampleBulletFactory(getCtx: () => RenderCtx) {
  const fn: t.ListBulletRenderer = (e) => {
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
export function sampleBodyFactory(getCtx: () => RenderCtx) {
  const fn: t.ListBulletRenderer = (e) => {
    const ctx = getCtx();
    const bodyKind = ctx.bodyKind;

    if (e.kind === 'Spacing') return null;

    const styles = {
      card: {
        base: css({ PaddingX: 30, PaddingY: 12, position: 'relative' }),
        data: css({ Absolute: [null, 3, 2, null], fontSize: 8, color: color.format(-0.3) }),
      },
      vanilla: css({ PaddingX: 6, PaddingY: 2 }),
      component: css({ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }),
    };

    type D = { msg: string };
    const data = e.data as D;
    const elComponent = <Text.Syntax text={'<Component>'} style={styles.component} />;

    /**
     * Body: Vanilla (Sample)
     */
    if (bodyKind === 'Vanilla') {
      return <div {...styles.vanilla}>{elComponent}</div>;
    }

    /**
     * Body: Card (Sample)
     */
    if (bodyKind === 'Card') {
      const { selected, focused } = e.is;
      const bgHighlight = color.alpha(COLORS.MAGENTA, 0.03);
      const bgHighlightBlurred = color.alpha(COLORS.CYAN, 0.08);

      const borderColor = !selected ? undefined : focused ? COLORS.MAGENTA : -0.5;
      const background = !selected ? undefined : focused ? bgHighlight : bgHighlightBlurred;
      return (
        <Card style={styles.card.base} border={{ color: borderColor }} background={background}>
          {elComponent}
          <div {...styles.card.data}>{data.msg}</div>
        </Card>
      );
    }

    // Not found.
    return <Renderers.Body.Default {...e} minWidth={250} />; // NB: same as returning [undefined].
  };

  return fn;
}
