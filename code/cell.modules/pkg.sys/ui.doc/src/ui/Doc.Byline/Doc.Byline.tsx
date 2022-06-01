import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue } from '../../common';
import { Avatar } from './ui/Avatar';
import { Props } from './ui/Props';

export type DocBylineProps = {
  avatarUrl?: string;
  style?: CssValue;
};

export const DocByline: React.FC<DocBylineProps> = (props) => {
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

  const elAvatar = props.avatarUrl && <Avatar url={props.avatarUrl} style={styles.right.avatar} />;
  const elProps = <Props />;
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
