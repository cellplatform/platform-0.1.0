import React from 'react';
import { k, css, color, COLORS } from '../common';
import { Card } from '../../Card';
import { SyntaxLabel } from '../../SyntaxLabel';

export type CtxRender = {
  bodySample: 'Card' | 'Vanilla';
};

export const renderFactory: k.BulletRenderFactory<CtxRender> = (getCtx) => {
  return {
    data: { foo: 123 },

    /**
     * Render [Bullet] visual.
     */
    renderBullet(e) {
      const border = `solid 5px ${color.format(-0.1)}`;

      const styles = {
        base: css({
          Flex: 'vertical-stretch-stretch',
          minWidth: e.is.vertical && 60,
          minHeight: e.is.horizontal && 60,
        }),
        edge: {
          base: css({
            flex: 1,
            border,
            borderRight: e.edge === 'near' && 'none',
            borderLeft: e.edge === 'far' && 'none',
          }),
          top: css({ borderBottom: 'none' }),
          bottom: css({ borderTop: 'none' }),
          spacer: css({ flex: 1 }),
        },
        middle: {
          line: css({ borderTop: border }),
          spacer: css({
            borderRight: e.edge === 'far' && border,
            borderLeft: e.edge === 'near' && border,
            flex: 1,
          }),
        },
      };
      if (e.is.first) {
        return (
          <div {...styles.base}>
            <div {...styles.edge.spacer} />
            <div {...css(styles.edge.base, styles.edge.top)} />
          </div>
        );
      }

      if (e.is.last) {
        return (
          <div {...styles.base}>
            <div {...css(styles.edge.base, styles.edge.bottom)} />
            <div {...styles.edge.spacer} />
          </div>
        );
      }

      return (
        <div {...styles.base}>
          <div {...styles.middle.spacer} />
          <div {...css(styles.middle.line)} />
          <div {...styles.middle.spacer} />
        </div>
      );
    },

    /**
     * Render body [Content] visual.
     */
    renderBody(e) {
      const ctx = getCtx();

      const styles = {
        base: css({
          MarginY: e.is.vertical && 10,
          MarginX: e.is.horizontal && 10,
        }),
        sample: {
          card: css({ PaddingX: 30, PaddingY: 12, MarginY: 5 }),
          vanilla: css({ PaddingX: 8, PaddingY: 5 }),
        },

        component: css({
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: 16,
        }),
      };

      const elComponent = <SyntaxLabel text={'<Component>'} style={styles.component} />;

      if (ctx.bodySample === 'Vanilla') {
        return <div {...styles.sample.vanilla}>{elComponent}</div>;
      }

      if (ctx.bodySample === 'Card') {
        return <Card style={styles.sample.card}>{elComponent}</Card>;
      }

      return <div>{`Body Renderer Not Found: "${ctx.bodySample}"`}</div>;
    },
  };
};
