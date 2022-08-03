import React, { useEffect, useRef } from 'react';

import { Color, css, CssValue, DEFAULT, FC, t } from './common';
import { RenderStyleOnce } from './SpinnerStyle';

export type SpinnerProps = {
  color?: string | number;
  size?: 12 | 18 | 22 | 32;
  style?: CssValue;
};

const View: React.FC<SpinnerProps> = (props) => {
  const baseRef = useRef<HTMLDivElement>(null);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const Base = require('./spin.lib'); // eslint-disable-line
    const config = Util.toConfig(props);
    const spinner = new Base.Spinner(config).spin(baseRef.current);
    return () => spinner?.stop();
  }, [props.color, props.size]); // eslint-disable-line

  /**
   * [Render]
   */
  const styles = {
    base: css({
      display: 'inline-block',
      position: 'relative',
      Size: Util.toSize(props),
    }),
  };

  return (
    <div ref={baseRef} {...css(styles.base, props.style)}>
      <RenderStyleOnce />
    </div>
  );
};

/**
 * [Helpers]
 */

const Util = {
  toSize(props: SpinnerProps) {
    const { size = DEFAULT.size } = props;
    if (!DEFAULT.sizes.includes(size)) throw new Error(`Spinner size '${size}' not supported.`);
    return size;
  },

  toConfig(props: SpinnerProps): t.SpinnerConfig {
    const { color = -1 } = props;
    const size = Util.toSize(props);

    const result: t.SpinnerConfig = {
      animation: 'spinner-line-fade-quick',
      color: Color.format(color),
      corners: 1,
    };
    switch (size) {
      case 12:
        return { ...result, width: 1.5, radius: 2.5, length: 2, lines: 8 };
      case 18:
        return { ...result, width: 2, radius: 3.5, length: 3, lines: 10 };
      case 22:
        return { ...result, width: 2, radius: 5, length: 4, lines: 12 };
      case 32:
        return { ...result, width: 3, radius: 7, length: 6, lines: 12 };
    }
  },
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
};

export const Spinner = FC.decorate<SpinnerProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'Spinner' },
);
