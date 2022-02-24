import React from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';

export type TypeLabelProps = {
  text: string;
  style?: CssValue;
  color?: string | number;
  onClick?: (e: { text: string }) => void;
};

export const TypeLabel: React.FC<TypeLabelProps> = (props) => {
  const { text, onClick } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      fontSize: 11,
      fontWeight: 600,
      fontFamily: 'monospace',
      color: props.color,
      cursor: onClick ? 'pointer' : 'default',
    }),
  };

  /**
   * TODO 🐷
   *    Memoize this. 🌳🌳🌳🌳🌳🌳
   */

  const parts = text.split('/');
  const elParts = parts.map((part, i) => {
    const isFirst = i === 0;
    const isLast = i === parts.length - 1;

    const styles = {
      base: css({ userSelect: 'auto' }),
      value: {
        base: css({}),
        first: css({}),
        last: css({ color: COLORS.MAGENTA }),
      },
      slash: css({ color: COLORS.CYAN, MarginX: 2 }),
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

    return (
      <>
        {elValue}
        {!isLast && (
          <span key={`slash.${i}`} {...styles.slash}>
            {'/'}
          </span>
        )}
      </>
    );
  });

  return (
    <div key={`typename`} {...css(styles.base, props.style)} onClick={() => onClick?.({ text })}>
      {/* {text} */}
      {elParts}
    </div>
  );
};
