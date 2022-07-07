import React from 'react';

import { DocIdentity } from '../Doc.Identity';
import { COLORS, css, CssValue } from './common';

type SrcUrl = string;

export type DocBylineDivider = {
  thickness?: number;
  color?: string | number;
  opacity?: number;
  spacing?: number;
};

export type DocBylineProps = {
  version: string;
  author: { name: string; avatar: SrcUrl };
  divider?: DocBylineDivider;
  align?: 'left' | 'right';
  style?: CssValue;
};

export const DocByline: React.FC<DocBylineProps> = (props) => {
  const { version, author, align = 'left', divider = {} } = props;
  const isLeft = align === 'left';

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
