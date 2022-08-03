import React from 'react';

import { color, COLORS, css } from '../../common';
import { OptionClickEventHandler, OptionItem, OptionRenderFactory } from './types';

/**
 * Single radio button.
 */
export type OptionButtonProps = {
  ctx: { items: OptionItem[]; index: number };
  kind: 'radio' | 'checkbox';
  isSelected?: boolean;
  isEnabled?: boolean;
  canDeselect?: boolean;
  item: OptionItem;
  factory?: OptionRenderFactory;
  onClick?: OptionClickEventHandler;
};

export const OptionButton: React.FC<OptionButtonProps> = (props) => {
  const { item, kind, onClick, ctx, factory } = props;
  const isSelected = Boolean(props.isSelected);
  const { label, value } = item;
  const { index, items } = ctx;
  const isLast = index === items.length - 1;
  const isEnabled = props.isEnabled ?? true;
  const canDeselect = props.canDeselect ?? true;

  const size = 12;
  const styles = {
    base: css({
      Flex: 'horizontal-start-stretch',
      boxSizing: 'border-box',
      position: 'relative',
      userSelect: 'none',
      opacity: isEnabled ? 1 : 0.4,
      cursor: isEnabled && (!isSelected || canDeselect) ? 'pointer' : 'default',
      color: COLORS.DARK,
      marginBottom: 7,
      ':last-child': { marginBottom: 0 },
    }),
    bullet: {
      base: css({
        position: 'relative',
        Flex: 'center-center',
        marginTop: 1,
        width: size,
        height: size,
        borderRadius: kind === 'radio' ? '100%' : 3,
        backgroundColor: isSelected ? COLORS.BLUE : COLORS.WHITE,
        border: `solid 1px ${color.format(isSelected ? -0.06 : -0.15)}`,
        boxShadow: !isSelected ? `inset 0 2px 2px 0 ${color.format(-0.1)}` : undefined,
      }),
      selected: {
        radio: css({
          position: 'relative',
          width: size - 6,
          height: size - 6,
          borderRadius: size,
          backgroundColor: COLORS.WHITE,
        }),
        checkbox: {
          base: css({ Absolute: 0 }),
          tick: css({
            boxSizing: 'border-box',
            width: 5,
            height: 9,
            borderRight: `solid 2px ${COLORS.WHITE}`,
            borderBottom: `solid 2px ${COLORS.WHITE}`,
            transform: `rotate(38deg)`,
            Absolute: [null, null, null, 4],
          }),
        },
      },
    },
    label: css({
      position: 'relative',
      width: '100%',
      flex: 1,
      marginLeft: 6,
      fontSize: 14,
      display: 'flex',
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
          action: { select: !Boolean(isSelected), deselect: Boolean(isSelected) },
        });
      }
    }
  };

  const elRadioSelected = isSelected && kind === 'radio' && (
    <div {...styles.bullet.selected.radio} />
  );

  const elCheckboxSelected = isSelected && kind === 'checkbox' && (
    <div {...styles.bullet.selected.checkbox.base}>
      <div {...styles.bullet.selected.checkbox.tick} />
    </div>
  );

  const elLabel =
    typeof factory?.label === 'function'
      ? factory.label({ label, value, index, isSelected, isEnabled, isLast })
      : undefined;

  return (
    <div {...styles.base} onMouseDown={handleClick}>
      <div {...styles.bullet.base}>
        {elRadioSelected}
        {elCheckboxSelected}
      </div>
      <div {...css(styles.label, styles.ellipsis)}>{elLabel || label}</div>
    </div>
  );
};
