import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Card, ObjectView } from './common';

export type DevSampleProps = { style?: CssValue };

export const DevSample: React.FC<DevSampleProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', color: COLORS.DARK }),
    card: {
      base: css({ padding: 20, minWidth: 300 }),
      data: css({}),
      fs: css({}),
      selection: css({}),
    },
    connector: {
      base: css({ Flex: 'x-spaceBetween-stretch' }),
      middle: css({
        backgroundColor: Color.alpha(COLORS.DARK, 0.15),
        width: 30,
        height: 15,
      }),
    },
  };

  const elConnector = (
    <div {...styles.connector.base}>
      <div />
      <div {...styles.connector.middle} />
      <div />
    </div>
  );

  const elDataCard = (
    <Card style={css(styles.card.base, styles.card.data)}>
      <ObjectView data={{ data: 123 }} />
    </Card>
  );

  const elFilesystemCard = (
    <Card style={css(styles.card.base, styles.card.fs)}>
      <div>Filesystem</div>
    </Card>
  );

  const elSelectionCard = (
    <Card style={css(styles.card.base, styles.card.selection)}>
      <div>Selection</div>
    </Card>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elDataCard}
      {elConnector}
      {elFilesystemCard}
      {elConnector}
      {elSelectionCard}
    </div>
  );
};
