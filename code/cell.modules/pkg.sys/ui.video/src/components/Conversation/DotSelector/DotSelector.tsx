import React from 'react';
import { css, CssValue } from '../common';
import { DotSelectorClickEventHandler, DotSelectorDot, DotSelectorItem } from './DotSelector.Dot';

export { DotSelectorClickEventHandler, DotSelectorItem };

export type DotSelectorProps = {
  selected?: string;
  items?: (DotSelectorItem | string)[];
  style?: CssValue;
  defaultColor?: string | number;
  highlightColor?: string | number;
  selectedColor?: string | number;
  onClick?: DotSelectorClickEventHandler;
};

/**
 * A row of dots that are selectable
 */
export const DotSelector: React.FC<DotSelectorProps> = (props) => {
  const { defaultColor, highlightColor, selectedColor } = props;

  const items = (props.items || []).map((item) =>
    typeof item === 'object' ? item : { label: item, value: item },
  );

  const styles = {
    base: css({
      Flex: 'horizontal-center-center',
    }),
    dot: {
      marginRight: 10,
      ':last-child': { marginRight: 0 },
    },
  };

  const elDots = items.map((item, i) => {
    const isSelected = item.value === props.selected;
    return (
      <DotSelectorDot
        key={i}
        item={item}
        isSelected={isSelected}
        style={styles.dot}
        onClick={props.onClick}
        defaultColor={defaultColor}
        highlightColor={highlightColor}
        selectedColor={selectedColor}
      />
    );
  });

  return <div {...css(styles.base, props.style)}>{elDots}</div>;
};
export * from './DotSelector';
