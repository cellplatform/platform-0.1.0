import React from 'react';

import { color, COLORS, CONSTANTS, css, FC, semver, t } from './common';

export type SemverProps = {
  version?: string;
  prefix?: string | JSX.Element;
  suffix?: string | JSX.Element;
  tooltip?: string;
  fontSize?: number;
  style?: t.CssValue;
};

/**
 * "Semantic Version" label.
 *
 *    - https://semver.org
 *    - https://github.com/semver/semver/blob/master/semver.md (SPECIFICATION)
 *
 */
const View: React.FC<SemverProps> = (props) => {
  const { fontSize = 14, prefix, suffix } = props;
  const version = props.version;

  if (!(version || prefix || suffix)) return null;

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
      Flex: 'x-center-center',
    }),
    prefix: css({ marginRight: version ? '0.36em' : undefined }),
    suffix: css({ marginLeft: version ? '0.36em' : undefined }),
    version: css({}),
  };

  const elPrefix = prefix && <div {...styles.prefix}>{prefix}</div>;
  const elSuffix = suffix && <div {...styles.suffix}>{suffix}</div>;
  const elVersion = version && <div {...styles.version}>{version}</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.text} title={props.tooltip}>
        {elPrefix}
        {elVersion}
        {elSuffix}
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
