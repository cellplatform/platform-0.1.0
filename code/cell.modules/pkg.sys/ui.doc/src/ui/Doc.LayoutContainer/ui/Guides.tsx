import React from 'react';
import { Color, COLORS, css, CssValue, t } from '../../common';

export type GuidesProps = {
  sizes: t.DocLayoutSizes;
  style?: CssValue;
};

export const Guides: React.FC<GuidesProps> = (props) => {
  const { sizes } = props;
  const border = `solid 1px ${Color.alpha(COLORS.MAGENTA, 0.3)}`;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, pointerEvents: 'none', Flex: 'x-stretch-stretch' }),
    edge: css({ flex: 1 }),
    center: css({
      width: sizes.column.width,
      borderRight: border,
      borderLeft: border,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.edge} />
      <div {...styles.center} />
      <div {...styles.edge} />
    </div>
  );
};
