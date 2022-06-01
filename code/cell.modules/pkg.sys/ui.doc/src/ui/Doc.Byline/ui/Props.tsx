import React from 'react';
import { Chip, COLORS, css, CssValue, PropList, t } from '../common';

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

  const hash = '0x66Ab0BC088212195b0d9e9FEB12F3f93fF6f8fF1'; // TEMP 🐷
  const elIdentity = <Chip.Hash text={hash.substring(0, 6)} clipboard={() => hash} />;

  const items: t.PropListItem[] = [
    { label: 'Version', value: `0.1.3 (Jun 2022)` },
    { label: 'Author', value: 'Rowan Yeoman' },
    { label: 'Identity', value: elIdentity },
  ];

  return (
    <PropList items={items} style={css(styles.base, props.style)} defaults={{ clipboard: false }} />
  );
};
