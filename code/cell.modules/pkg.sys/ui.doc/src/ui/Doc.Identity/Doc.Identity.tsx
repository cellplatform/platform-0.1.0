import React from 'react';

import { COLORS, css, CssValue } from './common';
import { Avatar } from './ui/Avatar';
import { Props } from './ui/Props';

type SrcUrlString = string;
type SemverString = string;

export type DocIdentityProps = {
  version: SemverString;
  author: { name: string; avatar: SrcUrlString };
  style?: CssValue;
};

export const DocIdentity: React.FC<DocIdentityProps> = (props) => {
  const { version, author } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({}),
    identity: {
      base: css({ Flex: `x-start-start`, color: COLORS.DARK }),
      avatar: css({ marginRight: 12 }),
    },
  };

  const elAvatar = <Avatar url={author.avatar} style={styles.identity.avatar} />;
  const elProps = <Props author={author.name} version={version} />;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.identity.base}>
        {elAvatar}
        {elProps}
      </div>
    </div>
  );
};
