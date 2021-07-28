import React from 'react';

import { css, CssValue, t } from '../../common';
import { DotTabstripItem } from './DotTabstrip.Item';
import { toItems } from './util';

type Index = number;

export type DotTabstripProps = {
  selected?: Index;
  items?: (t.DotTabstripItem | string)[];
  orientation?: 'x' | 'y';
  defaultColor?: string | number;
  highlightColor?: string | number;
  selectedColor?: string | number;
  errorColor?: string | number;
  style?: CssValue;
  onClick?: t.DotTabstripClickEventHandler;
};

/**
 * A row of dots that are selectable
 */
export const DotTabstrip: React.FC<DotTabstripProps> = (props) => {
  const { orientation = 'x' } = props;

  const items = toItems(props.items);
  const is = {
    horizontal: orientation === 'x',
    vertical: orientation === 'y',
  };

  const styles = {
    base: css({
      Flex: `${is.horizontal ? 'horizontal' : 'vertical'}-center-center`,
    }),
    dot: {
      marginRight: is.horizontal && 10,
      marginBottom: is.vertical && 10,
      ':last-child': {
        marginRight: is.horizontal && 0,
        marginBottom: is.vertical && 0,
      },
    },
  };

  const elItems = items.map((item, index) => {
    const isSelected = index === props.selected;
    return (
      <DotTabstripItem
        key={index}
        index={index}
        item={item}
        isSelected={isSelected}
        style={styles.dot}
        onClick={props.onClick}
        defaultColor={props.defaultColor}
        highlightColor={props.highlightColor}
        selectedColor={props.selectedColor}
        errorColor={props.errorColor}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elItems}</div>;
};

export default DotTabstrip;
