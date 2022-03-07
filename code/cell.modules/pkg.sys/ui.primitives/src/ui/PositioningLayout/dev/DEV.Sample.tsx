import React from 'react';

import { color, css, CssValue, t } from '../common';
import { DevSampleProplist } from './DEV.Sample.Proplist';

type Id = string;

export type DevSampleProps = {
  id: Id;
  selected?: Id;
  info?: t.PositioningLayoutInfo;
  overlaps: t.PositioningLayoutOverlapInfo[];
  find: t.PositioningLayoutQuery;
  style?: CssValue;
  onClick?: (e: { id: Id }) => void;
};

export const DevSample: React.FC<DevSampleProps> = (props) => {
  const { id, info, find, overlaps } = props;

  const onClick = () => {
    console.log('lookup:', find.first(id));
  };

  /**
   * Render
   */
  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      userSelect: 'none',
      border: `dashed 1px ${color.format(-0.15)}`,
      borderRadius: 8,
      margin: 3,
      Padding: [10, 15, 10, 8],
      minWidth: 250,
      backgroundColor: color.format(-0.03),
    }),
    hand: css({ Absolute: [-8, -8, null, null] }),
    info: css({ fontSize: 10 }),
  };

  return (
    <div {...css(styles.base, props.style)} onClick={onClick}>
      <DevSampleProplist id={id} info={info} overlaps={overlaps} />
      <div {...styles.hand}>👋</div>
    </div>
  );
};
