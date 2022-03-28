import React, { useState } from 'react';
import { color, COLORS, css, CssValue } from '../common';

export type TypeLabelProps = {
  text: string;
  monochrome?: boolean;
  style?: CssValue;

  onClick?: (e: { text: string }) => void;
};

export const TypeLabel: React.FC<TypeLabelProps> = (props) => {
  const { text, onClick, monochrome = false } = props;
  const [mouseDown, setMouseDown] = useState(false);

  const styles = {
    base: css({
      fontSize: 11,
      fontFamily: 'monospace',
      cursor: onClick ? 'pointer' : 'default',
      userSelect: 'none',
      transform: onClick ? `translate(0px, ${mouseDown ? 1 : 0}px)` : undefined,
    }),
  };

  const elParts = React.useMemo(() => {
    const parts = text.split('/');
    return parts.map((item, index) => renderPart({ parts, index, monochrome }));
  }, [text, monochrome]);

  return (
    <div
      {...css(styles.base, props.style)}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onMouseLeave={() => setMouseDown(false)}
      onClick={() => onClick?.({ text })}
    >
      {elParts}
    </div>
  );
};

/**
 * Helpers
 */

export const renderPart = (args: { parts: string[]; index: number; monochrome: boolean }) => {
  const { parts, index, monochrome } = args;
  const part = parts[index];
  const isFirst = index === 0;
  const isLast = index === parts.length - 1;

  const styles = {
    base: css({ userSelect: 'auto' }),
    value: {
      base: css({ fontWeight: 600, color: COLORS.DARK }),
      first: css({}),
      last: css({
        color: monochrome ? color.alpha(COLORS.DARK, 0.7) : COLORS.TEXT_RED,
      }),
    },
    slash: css({ fontWeight: 600, color: COLORS.TEXT_RED }),
  };

  const elValue = (
    <span
      key={`value.${index}`}
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
    <span key={`slash.${index}`} {...styles.slash}>
      {'/'}
    </span>
  );

  return [elValue, elLast];
};
