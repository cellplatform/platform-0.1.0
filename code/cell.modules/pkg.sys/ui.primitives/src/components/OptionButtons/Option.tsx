import React from 'react';

import Tick from '../../../static/icons/checkbox-tick.svg';
import { color, COLORS, constants, css, defaultValue } from '../../common';
import { OptionClickEventHandler, OptionItem } from './types';

/**
 * Single radio button.
 */
export type OptionButtonProps = {
  ctx: { items: OptionItem[]; index: number };
  kind: 'radio' | 'checkbox';
  isSelected?: boolean;
  isEnabled?: boolean;
  canDeselect?: boolean;
  option: OptionItem;
  onClick?: OptionClickEventHandler;
};

export const OptionButton: React.FC<OptionButtonProps> = (props) => {
  const { isSelected, option, kind, onClick, ctx } = props;
  const { label } = option;
  const isEnabled = defaultValue(props.isEnabled, true);
  const canDeselect = defaultValue(props.canDeselect, true);

  const size = 12;
  const styles = {
    base: css({
      Flex: 'horizontal-center-stretch',
      boxSizing: 'border-box',
      position: 'relative',
      userSelect: 'none',
      opacity: isEnabled ? 1 : 0.4,
      cursor: isEnabled && (!isSelected || canDeselect) ? 'pointer' : 'default',
      marginBottom: 7,
      ':last-child': { marginBottom: 0 },
    }),
    bullet: {
      base: css({
        Flex: 'center-center',
        width: size,
        height: size,
        borderRadius: kind === 'radio' ? '100%' : 3,
        backgroundColor: isSelected ? COLORS.BLUE : COLORS.WHITE,
        border: `solid 1px ${color.format(isSelected ? -0.06 : -0.15)}`,
        boxShadow: !isSelected ? `inset 0 2px 2px 0 ${color.format(-0.1)}` : undefined,
      }),
      selected: {
        radio: css({
          width: size - 6,
          height: size - 6,
          borderRadius: size,
          backgroundColor: COLORS.WHITE,
        }),
        checkbox: css({}),
      },
    },
    label: css({
      marginLeft: 6,
      flex: 1,
      width: '100%',
      fontFamily: constants.FONT.MONO,
      fontSize: 12,
      opacity: isSelected ? 1 : 0.7,
    }),
    ellipsis: css({
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
  };

  const handleClick = () => {
    if (isSelected && !canDeselect) return;
    if (onClick) {
      const { index, items } = ctx;
      const item = items[index];
      if (item) {
        onClick({
          index,
          item,
          items,
          action: {
            select: !Boolean(isSelected),
            deselect: Boolean(isSelected),
          },
        });
      }
    }
  };

  const elRadioSelected = isSelected && kind === 'radio' && (
    <div {...styles.bullet.selected.radio} />
  );

  const elCheckboxSelected = isSelected && kind === 'checkbox' && (
    <div {...styles.bullet.selected.checkbox}>
      <Tick color={COLORS.WHITE} width={10} height={10} />
    </div>
  );

  return (
    <div {...styles.base} onMouseDown={handleClick}>
      <div {...styles.bullet.base}>
        {elRadioSelected}
        {elCheckboxSelected}
      </div>
      <div {...css(styles.label, styles.ellipsis)}>{label}</div>
    </div>
  );
};
