import React from 'react';

import { color, COLORS, css, t, FC, semver, CONSTANTS } from './common';

export type SemverProps = {
  version?: string;
  tooltip?: string;
  fontSize?: number;
  style?: t.CssValue;
};

/**
 * "Semantic Version" label.
 *
 * - https://semver.org
 * - https://github.com/semver/semver/blob/master/semver.md (SPECIFICATION)
 *
 */
const View: React.FC<SemverProps> = (props) => {
  const { fontSize = 14 } = props;
  const text = props.version;
  if (!text) return null;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      display: 'inline-block',
      cursor: 'default',
    }),
    text: css({
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: color.alpha(COLORS.DARK, 1),
      letterSpacing: -0.5,
      fontSize,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.text} title={props.tooltip}>
        {text}
      </div>
    </div>
  );
};

/**
 * Export
 */

type Fields = {
  default: string;
  semver: typeof semver;
  constants: typeof CONSTANTS;
};
export const Semver = FC.decorate<SemverProps, Fields>(
  View,
  { semver, constants: CONSTANTS, default: '0.0.0' },
  { displayName: 'Semver' },
);
