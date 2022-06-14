import React from 'react';
import { color, css, CssValue } from '../../common';

const BORDER_HR = `solid 8px ${color.format(-0.05)}`;

/**
 * Column Title
 */
export type BodyColumnTitleProps = {
  children?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: CssValue;
};
export const BodyColumnTitle: React.FC<BodyColumnTitleProps> = (props) => {
  const { left = <div />, right = <div /> } = props;
  /**
   * [Render]
   */
  const styles = {
    base: css({
      Flex: 'x-spaceBetween-center',
      fontWeight: 'bold',
      fontSize: 11,
      color: color.format(-0.25),
      borderBottom: BORDER_HR,
      marginBottom: 8,
      PaddingY: 8,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      {left}
      {props.children}
      {right}
    </div>
  );
};

/**
 * <HR> Horizontal Rule
 */
export type BodyColumnHrProps = { style?: CssValue };
export const BodyColumnHr: React.FC<BodyColumnHrProps> = (props) => {
  const styles = { base: css({ borderTop: BORDER_HR, MarginY: 5 }) };
  return <div {...css(styles.base, props.style)} />;
};
