import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx, Card, ObjectView, Filesystem } from './common';

type InstanceId = string;
type FilesystemId = string;

export type DevSampleProps = {
  instance: { bus: t.EventBus<any>; id: InstanceId; fs: FilesystemId };
  style?: CssValue;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { instance } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', color: COLORS.DARK }),
    card: {
      base: css({ minWidth: 350, userSelect: 'auto' }),
      data: css({ padding: 20 }),
      fs: {
        base: css({
          Padding: [15, 0],
        }),
        list: css({
          backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          minHeight: 120,
        }),
      },
      selection: css({ padding: 20 }),
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
    <Card style={css(styles.card.base, styles.card.fs.base)}>
      <Filesystem.PathList.Stateful
        // instance={{ ...instance, id: `${instance.id}.card` }}
        instance={{ ...instance }}
        style={styles.card.fs.list}
        // height={120}
      />
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
