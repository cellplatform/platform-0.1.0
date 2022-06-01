import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, PropList, Button } from '../common';

export type PropsProps = {
  style?: CssValue;
};

export const Props: React.FC<PropsProps> = (props) => {
  /**
   * [Render]
   */

  const styles = {
    base: css({
      width: 180,
    }),
    link: css({ color: COLORS.BLUE }),
  };

  const identityUrl = 'https://etherscan.io/address/0x66Ab0BC088212195b0d9e9FEB12F3f93fF6f8fF1';

  const elIdentity = (
    <Button>
      <a href={identityUrl} target={'_blank'} rel={'noreferrer'} {...styles.link}>
        {'0x66Ab'}
      </a>
    </Button>
  );

  const items: t.PropListItem[] = [
    { label: 'Version', value: `0.1.3 (Jun 2022)` },
    { label: 'Author', value: 'Rowan Yeoman' },
    { label: 'Identity', value: elIdentity },
  ];

  return <PropList items={items} style={css(styles.base, props.style)} />;
};
