import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Card, ObjectView } from './common';

type InstanceId = string;
type FilesystemId = string;

export type DevSampleProps = {
  instance: { bus: t.EventBus<any>; id: InstanceId; fs: FilesystemId };
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', color: COLORS.DARK }),
    card: {
      base: css({ padding: 20, minWidth: 350, userSelect: 'auto' }),
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
      <div>filesystem</div>
    </Card>
  );

  const elToolsCard = (
    <Card style={css(styles.card.base, styles.card.selection)}>
      <div>toolbar</div>
    </Card>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elFilesystemCard}
      {elConnector}
      {elDataCard}
      {elConnector}
      {elToolsCard}
    </div>
  );
};
