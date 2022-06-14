import React from 'react';

import { color, css, CssValue, t } from '../common';
import { BodyColumnLeft } from './Body.Column.Left';
import { BodyColumnRight } from './Body.Column.Right';

export type NetworkCardBodyProps = {
  instance: { network: t.PeerNetwork; id: t.Id };
  style?: CssValue;
};

export const NetworkCardBody: React.FC<NetworkCardBodyProps> = (props) => {
  const { instance } = props;

  /**
   * [Render]
   */
  const BORDER_TRACE = `solid 1px ${color.format(-0.03)}`;

  const styles = {
    base: css({ Flex: 'x-stretch-stretch', position: 'relative' }),
    column: css({ flex: 1 }),
    divider: css({ width: 20 }),
    trace: css({ borderLeft: BORDER_TRACE, borderRight: BORDER_TRACE }),
  };

  const elDivider = <div {...styles.divider} />;
  const elDivTraceEdges = <div {...css(styles.divider, styles.trace)} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elDivider}
      <BodyColumnLeft instance={instance} style={styles.column} />
      {elDivTraceEdges}
      <BodyColumnRight instance={instance} style={styles.column} />
      {elDivider}
    </div>
  );
};
