import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue } from '../../common';
import { Avatar } from './ui/Avatar';
import { Props } from './ui/Props';

type SrcUrl = string;

export type DocBylineProps = {
  version: string;
  author: { name: string; avatar: SrcUrl };
  style?: CssValue;
};

export const DocByline: React.FC<DocBylineProps> = (props) => {
  const { version, author } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ position: 'relative', Flex: 'x-spaceBetween-center' }),
    left: css({}),
    right: {
      base: css({ Flex: 'x-start-start' }),
      avatar: css({ marginRight: 12 }),
    },
  };

  const elLeft = <div {...styles.left}></div>;

  const elAvatar = <Avatar url={author.avatar} style={styles.right.avatar} />;
  const elProps = <Props author={author.name} version={version} />;
  const elRight = (
    <div {...styles.right.base}>
      {elAvatar}
      {elProps}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elLeft}
      {elRight}
    </div>
  );
};
