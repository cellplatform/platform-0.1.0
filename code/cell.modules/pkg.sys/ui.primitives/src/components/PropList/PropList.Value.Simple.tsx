import React from 'react';

import { color, COLORS, css, defaultValue, t } from '../../common';
import { CopyIcon } from './PropList.Value.common';

export type SimpleValueProps = {
  defaults: t.PropListDefaults;
  value: t.PropListValue;
  message?: React.ReactNode;
  isOver?: boolean;
  isCopyable?: boolean;
};

export const SimpleValue: React.FC<SimpleValueProps> = (props) => {
  const { value, message } = props;

  const is = toFlags(props);
  const textColor = toTextColor(props);

  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      height: 13,
    }),
    text: css({
      Absolute: 0,
      color: textColor,
      width: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: is.copyActive ? 'pointer' : 'default',
      textAlign: 'right',
      fontFamily: is.monospace ? 'monospace' : undefined,
    }),
  };

  const text = message ? message : value.data?.toString();

  return (
    <div {...css(styles.base)}>
      <div {...styles.text}>{text}</div>
      {is.copyActive && !message && <CopyIcon />}
    </div>
  );
};

/**
 * [Helpers]
 */

function toTextColor(props: SimpleValueProps) {
  const is = toFlags(props);
  if (props.message) return color.format(-0.3);
  if (is.copyActive) return COLORS.BLUE;
  if (is.boolean) return COLORS.PURPLE;
  return COLORS.DARK;
}

function toFlags(props: SimpleValueProps) {
  const { value, isOver, isCopyable, defaults } = props;
  let monospace = defaultValue(value.monospace, defaults.monospace);
  if (typeof value.data === 'boolean') monospace = true;
  return {
    boolean: typeof value.data === 'boolean',
    copyActive: isOver && isCopyable,
    monospace,
  };
}
