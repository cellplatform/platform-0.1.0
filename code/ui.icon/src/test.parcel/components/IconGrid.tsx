import * as React from 'react';
import { constants } from './common';
import { IIcon } from '../../types';
import { css, color, CssValue } from '@platform/css';

export type IIconGridProps = {
  icons?: Array<{ name: string; icon: IIcon }>;
  style?: CssValue;
};

export const IconGrid = (props: IIconGridProps) => {
  const { icons = [] } = props;
  const styles = {
    base: css({
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignContent: 'flex-start',
      alignItems: 'flex-start',
    }),
  };
  const el = icons.map(({ icon, name }, i) => <IconTile key={i} icon={icon} name={name} />);
  return <div {...css(styles.base, props.style)}>{el}</div>;
};

const IconTile = (props: { icon: IIcon; name: string }) => {
  const styles = {
    base: css({
      Flex: 'vertical-center-center',
      width: 120,
      margin: 10,
      marginBottom: 20,
    }),
    name: css({
      fontSize: 12,
      color: color.format(-0.4),
      marginTop: 8,
      cursor: 'default',
    }),
  };
  return (
    <div {...styles.base}>
      <props.icon color={constants.COLORS.BLUE} />
      <div {...styles.name}>{props.name}</div>
    </div>
  );
};
