import React from 'react';
import { color, COLORS, css, CssValue } from '../../common';

export type TypeLabelProps = {
  text: string;
  style?: CssValue;
  color?: string | number;
  onClick?: (e: { text: string }) => void;
};

export const TypeLabel: React.FC<TypeLabelProps> = (props) => {
  const { text, onClick } = props;

  const styles = {
    base: css({
      fontSize: 11,
      fontFamily: 'monospace',
      color: props.color,
      cursor: onClick ? 'pointer' : 'default',
    }),
  };

  const elParts = React.useMemo(() => {
    const parts = text.split('/');
    return parts.map((item, i) => renderPart(parts, i));
  }, [text]);

  return (
    <div {...css(styles.base, props.style)} onClick={() => onClick?.({ text })}>
      {elParts}
    </div>
  );
};

/**
 * Helpers
 */

export const renderPart = (parts: string[], i: number) => {
  const part = parts[i];
  const isFirst = i === 0;
  const isLast = i === parts.length - 1;

  const styles = {
    base: css({ userSelect: 'auto' }),
    value: {
      base: css({ fontWeight: 500 }),
      first: css({}),
      last: css({ color: COLORS.CYAN, fontWeight: 600 }),
    },
    slash: css({ color: color.alpha(COLORS.DARK, 0.2), MarginX: 1 }),
  };

  const elValue = (
    <span
      key={`value.${i}`}
      {...css(
        styles.value.base,
        isFirst ? styles.value.first : undefined,
        isLast ? styles.value.last : undefined,
      )}
    >
      {part}
    </span>
  );

  const elLast = !isLast && (
    <span key={`slash.${i}`} {...styles.slash}>
      {'/'}
    </span>
  );

  return [elValue, elLast];
};
