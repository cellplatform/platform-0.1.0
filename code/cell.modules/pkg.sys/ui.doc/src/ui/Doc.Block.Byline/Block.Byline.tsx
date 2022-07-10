import React from 'react';

import { DocIdentity } from '../Doc.Identity';
import { COLORS, css, CssValue, FC, t, DEFAULT, ALL } from './common';

type SrcUrl = string;

export type DocBylineProps = {
  version: string;
  author: { name: string; avatar: SrcUrl };
  divider?: t.DocBylineDivider;
  align?: t.DocBylineAlign;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<DocBylineProps> = (props) => {
  const { version, author, align = 'Left', divider = {} } = props;
  const isLeft = align === 'Left';

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Flex: `x-center-${isLeft ? 'start' : 'end'}` }),
    identity: {
      base: css({ Flex: `x-start-start` }),
      avatar: css({ marginRight: 12 }),
    },
    divider: css({
      backgroundColor: divider.color ?? COLORS.DARK,
      height: divider.thickness ?? 5,
      opacity: divider.opacity ?? 0.3,
      marginBottom: divider.spacing ?? 10,
    }),
  };

  const elDivider = <div {...styles.divider} />;
  const elIdentity = <DocIdentity author={author} version={version} />;

  return (
    <div {...css(styles.base, props.style)}>
      {props.divider && elDivider}
      <div {...styles.body}>{elIdentity}</div>
    </div>
  );
};

/**
 * Export
 */
type Fields = {
  DEFAULT: typeof DEFAULT;
  ALL: typeof ALL;
};
export const DocBylineBlock = FC.decorate<DocBylineProps, Fields>(
  View,
  { DEFAULT, ALL },
  { displayName: 'Doc.BylineBlock' },
);
