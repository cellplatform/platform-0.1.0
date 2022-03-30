import React, { CSSProperties } from 'react';

import { color, COLORS, css, defaultValue, t } from '../../common';
import { CopyIcon } from './PropList.Value.common';
import { Text } from '../Text';

export type SimpleValueProps = {
  defaults: t.PropListDefaults;
  value: t.PropListValue;
  message?: React.ReactNode;
  cursor?: CSSProperties['cursor'];
  isOver?: boolean;
  isCopyable?: boolean;
};

export const SimpleValue: React.FC<SimpleValueProps> = (props) => {
  const { value, message } = props;

  const is = toFlags(props);
  const textColor = toTextColor(props);
  const cursor = defaultValue(props.cursor, is.copyActive ? 'pointer' : 'default');

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
      cursor,
      textAlign: 'right',
      fontFamily: is.monospace ? 'monospace' : undefined,
      fontSize: value.fontSize !== undefined ? value.fontSize : undefined,
    }),
  };

  const text = message ? message : value.data?.toString();

  return (
    <div {...css(styles.base)}>
      <div {...styles.text}>
        <Text.Syntax text={text?.toString()} />
      </div>
      {is.copyActive && !message && <CopyIcon />}
    </div>
  );
};

/**
 * [Helpers]
 */

function toTextColor(props: SimpleValueProps) {
  if (props.value.color !== undefined) return color.format(props.value.color);
  if (props.message) return color.format(-0.3);

  const is = toFlags(props);
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
