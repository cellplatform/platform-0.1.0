import { Lorem } from 'sys.ui.dev';
import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, Card } from '../common';
import { DocHeadline } from '../../Doc.Headline';
import { Wrangle } from '../Wrangle';

export type RowProps = {
  index: number;
  is: t.ListItemRenderFlags;
  data: t.DocListItemData;
  sizes: t.DocLayoutSizes;
  style?: CssValue;
};

export const Row: React.FC<RowProps> = (props) => {
  const { index, sizes, data } = props;
  const width = sizes.column.width;
  const showAsCard = Wrangle.showAsCard(data.showAsCard);

  /**
   * TODO 🐷
   */
  // console.log(' > ', index, '| showAsCard', showAsCard);

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, Flex: 'x-stretch-stretch' }),
    edge: css({ flex: 1 }),
    column: css({
      boxSizing: 'border-box',
      width,
      backgroundColor: showAsCard === undefined && 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
    body: {
      base: css({
        position: 'relative',
        padding: 20,
      }),

      card: css({
        Absolute: -10,
        pointerEvents: 'none',
      }),
    },
  };

  /**
   * TODO 🐷
   * - HARD CODED VALUE below
   * - Make renderable as JSX Element First
   * - Then add "DocDef" => <DocHeadlin> pluggable renderer function.
   */

  const cardStyles = Wrangle.card.styles(showAsCard);
  const elCard = showAsCard && (
    <Card
      background={cardStyles.background}
      border={cardStyles.border}
      shadow={cardStyles.shadow}
      style={styles.body.card}
    >
      {/* {elBody} */}
    </Card>
  );

  const elBody = (
    <div {...styles.body.base}>
      {elCard}
      <DocHeadline
        category={'Conceptual Schnizz'}
        title={Lorem.words(5)}
        // subtitle={Lorem.words(12)}
        hint={{ width }}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge} />
      <div {...styles.column}>{elBody}</div>
      <div {...styles.edge} />
    </div>
  );
};
