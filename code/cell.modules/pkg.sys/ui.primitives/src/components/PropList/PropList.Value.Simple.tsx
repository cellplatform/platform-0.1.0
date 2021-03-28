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
  const { value, message, isOver, isCopyable } = props;

  const isCopyActive = isOver && isCopyable;
  const isMonospace = defaultValue(value.monospace, props.defaults.monospace);
  const textColor = message ? color.format(-0.3) : isCopyActive ? COLORS.BLUE : COLORS.DARK;

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
      cursor: isCopyActive ? 'pointer' : 'default',
      textAlign: 'right',
      fontFamily: isMonospace ? 'monospace' : undefined,
    }),
  };

  const text = message ? message : value.data?.toString();

  return (
    <div {...css(styles.base)}>
      <div {...styles.text}>{text}</div>
      {isCopyActive && !message && <CopyIcon />}
    </div>
  );
};
