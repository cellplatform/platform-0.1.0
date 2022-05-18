import React from 'react';
import { color, t, css, COLORS } from '../common';
import { Card } from '../../Card';
import { Text } from '../../Text';
import { Renderers, BulletConnectorLinesProps } from '../renderers';
import { DataSample, RenderCtx } from './DEV.types';

const bodyRenderCount: number[] = []; // Debug 🐷. Keep a tally of the number of times each item has rendered.

/**
 * A factory that produces a function for rendering bullets
 * based on an input "type" flag.
 */
export function sampleBulletFactory(getCtx: () => RenderCtx) {
  const fn: t.ListItemRenderer = (e) => {
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
  const fn: t.ListItemRenderer = (e) => {
    const ctx = getCtx();
    const bodyKind = ctx.bodyKind;

    if (e.kind === 'Spacing') return null;

    bodyRenderCount[e.index] = (bodyRenderCount[e.index] ?? 0) + 1;

    const styles = {
      card: {
        base: css({
          PaddingX: 30,
          paddingTop: 10,
          paddingBottom: 18,
          position: 'relative',
          transform: e.is.mouse.down ? `translateY(1px)` : undefined,
        }),
        data: {
          base: css({
            fontSize: 8,
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: color.format(-0.4),
          }),
          bottomLeft: css({ Absolute: [null, null, 2, 3] }),
          bottomRight: css({ Absolute: [null, 3, 2, null] }),
        },
      },
      vanilla: css({ PaddingX: 6, PaddingY: 2 }),
      component: css({ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 16 }),
    };

    const data = e.data as DataSample;
    const truncatedAt = data.truncatedAt ?? 0;
    const remaining = ctx.total - truncatedAt;
    const text = truncatedAt ? `more:(..${remaining})` : `${e.index}.<Component>`;
    const elComponent = <Text.Syntax text={text} style={styles.component} />;

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
      const renderCount = `render:${bodyRenderCount[e.index]}`;

      const left = data.msg;
      const right = e.is.scrolling ? `(scrolling) ${renderCount}` : renderCount;

      return (
        <Card style={styles.card.base} border={{ color: borderColor }} background={background}>
          {elComponent}
          <div {...css(styles.card.data.base, styles.card.data.bottomLeft)}>{left}</div>
          <div {...css(styles.card.data.base, styles.card.data.bottomRight)}>{right}</div>
        </Card>
      );
    }

    // Not found.
    return <Renderers.Body.Default {...e} minWidth={250} />; // NB: same as returning [undefined].
  };

  return fn;
}
