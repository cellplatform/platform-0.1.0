import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';

type UrlString = string;

export type SampleLinksProps = {
  links: UrlString[];
  style?: CssValue;
};

export const SampleLinks: React.FC<SampleLinksProps> = (props) => {
  const { links } = props;
  const styles = {
    base: css({
      position: 'relative',
      marginTop: 40,
      borderTop: `solid 1px ${color.format(-0.1)}`,
    }),
    url: css({
      fontSize: 10,
    }),
  };

  const elLinks = links.map((url, i) => {
    return (
      <div key={i}>
        <div {...styles.url}>{url}</div>
      </div>
    );
  });

  return <div {...css(styles.base, props.style)}>{elLinks}</div>;
};
