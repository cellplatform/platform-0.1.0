import React from 'react';

import { COLORS, css, CssValue, t } from '../common';
import { Util } from './Util';

export type TextInputHintProps = {
  isEnabled: boolean;
  valueStyle: t.TextInputStyle;
  value: string;
  hint: string | JSX.Element;
  style?: CssValue;
};

/**
 * Used for displaying an auto-complete "hint".
 */
export const TextInputHint: React.FC<TextInputHintProps> = (props) => {
  const { isEnabled, value, hint, valueStyle } = props;
  const isString = typeof hint === 'string';

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      pointerEvents: 'none',
      boxSizing: 'border-box',
      paddingTop: 1,
      paddingLeft: 2,
      Flex: 'x-start-start',
    }),
    value: css({
      ...Util.css.toTextInput(isEnabled, valueStyle),
      color: COLORS.MAGENTA,
    }),
    hint: css({
      marginLeft: 1,
      opacity: isString ? 0.3 : 1,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.value}>{value}</div>
      <div {...styles.hint}>{hint}</div>
    </div>
  );
};
