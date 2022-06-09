import React from 'react';
import { Color, css, CssValue, t } from './DEV.common';

export type DevLayoutVerticalProps = {
  above?: React.ReactNode;
  below?: React.ReactNode;
  sizes: { card: t.DomRect };
  style?: CssValue;
};

export const DevLayoutVertical: React.FC<DevLayoutVerticalProps> = (props) => {
  const { sizes } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      boxSizing: 'border-box',
      pointerEvents: 'none',
      Flex: 'y-stretch-stretch',
    }),
  };

  const row = (children?: React.ReactNode) => {
    if (!children) return null;
    const width = sizes.card.width;
    return (
      <div {...css({ flex: 1, Flex: 'x-stretch-stretch' })}>
        <div {...css({ flex: 1 })} />
        <div {...css({ width, position: 'relative' })}>{children}</div>
        <div {...css({ flex: 1 })} />
      </div>
    );
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...css({ flex: 1, display: 'flex' })}>{row(props.above)}</div>
      <div {...css({ height: sizes.card.height })}></div>
      <div {...css({ flex: 1, display: 'flex' })}>{row(props.below)}</div>
    </div>
  );
};
