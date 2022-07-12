import React from 'react';

import { DocIdentity } from '../Doc.Identity';
import { COLORS, css, CssValue, FC, t, DEFAULT, ALL } from './common';
import { DocImage } from '../Doc.Image';

type SrcUrl = string;

export type DocBylineProps = {
  version: string;
  author: { name: string; avatar: SrcUrl; signature?: string };
  parts?: t.DocBylinePart[];
  divider?: t.DocBylineDivider;
  style?: CssValue;
};

/**
 * Component
 */
const View: React.FC<DocBylineProps> = (props) => {
  const { version, author, divider = {}, parts = DEFAULT.parts } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative' }),
    body: css({ Flex: `x-spaceBetween-center` }),
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

  const elParts: JSX.Element[] = [];

  parts.forEach((field, i) => {
    if (field === 'Space') {
      elParts.push(<div key={`empty.${i}`} />);
    }

    if (field === 'Doc.Author.Signature' && author.signature) {
      elParts.push(<DocImage key={`signature.${i}`} url={author.signature} height={64} />);
    }

    if (field === 'Doc.Identity') {
      elParts.push(<DocIdentity key={`doc.id.${i}`} author={author} version={version} />);
    }
  });

  return (
    <div {...css(styles.base, props.style)}>
      {props.divider && elDivider}
      <div {...styles.body}>{elParts}</div>
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
