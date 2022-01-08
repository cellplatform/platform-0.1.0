import React from 'react';
import { COLORS, css, CssValue, Icons } from '../../../common';

export type RepoLinkProps = {
  url: string;
  marginLeft?: number;
  style?: CssValue;
};

export const RepoLink: React.FC<RepoLinkProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      dislay: 'inline-block',
      marginLeft: props.marginLeft,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: 500,
    }),
    link: css({ Flex: 'horizontal-center-start', textDecoration: 'none' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <a {...styles.link} href={props.url} target={'_blank'} rel={'noreferrer'}>
        <Icons.Github size={14} style={css({ marginRight: 6 })} color={COLORS.DARK} />
        <div>repo/README</div>
      </a>
    </div>
  );
};
