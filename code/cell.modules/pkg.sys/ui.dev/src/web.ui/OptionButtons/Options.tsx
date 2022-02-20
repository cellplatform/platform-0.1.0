import React from 'react';

import { css, CssValue } from '../../common';
import { OptionButton } from './Option';
import { OptionClickEventHandler, OptionItem, OptionRenderFactory } from './types';

/**
 * Set of radio buttons.
 */
export type RadiosProps = {
  items?: (OptionItem | string)[];
  selected?: OptionItem | number;
  isEnabled?: boolean;
  isClearable?: boolean;
  factory?: OptionRenderFactory;
  style?: CssValue;
  onClick?: OptionClickEventHandler;
};

export const Radios: React.FC<RadiosProps> = (props) => {
  const items = Helpers.toItems(props.items);
  const selected = Helpers.toSingleSelected(items, props.selected);
  const isClearable = props.isClearable ?? false;

  const elOptions = items.map((option, index) => {
    const isSelected = Helpers.isSelected(option, selected);
    return (
      <OptionButton
        key={`rdo-${index}`}
        ctx={{ items, index }}
        kind={'radio'}
        item={option}
        isSelected={isSelected}
        isEnabled={props.isEnabled}
        canDeselect={isClearable}
        factory={props.factory}
        onClick={props.onClick}
      />
    );
  });

  const styles = { base: css({ position: 'relative' }) };
  return <div {...css(styles.base, props.style)}>{elOptions}</div>;
};

/**
 * Set of checkboxes.
 */
export type CheckboxesProps = {
  items?: (OptionItem | string)[];
  selected?: OptionItem | OptionItem[] | number | number[];
  isEnabled?: boolean;
  isClearable?: boolean;
  factory?: OptionRenderFactory;
  style?: CssValue;
  onClick?: OptionClickEventHandler;
};

export const Checkboxes: React.FC<CheckboxesProps> = (props) => {
  const items = Helpers.toItems(props.items);
  const selected = Helpers.toMultiSelected(items, props.selected);
  const isClearable = props.isClearable ?? true;

  const elOptions = items.map((option, index) => {
    const isSelected = Helpers.isAnySelected(option, selected);
    const isLastSelection = isSelected && selected.length === 1;
    const canDeselect = isClearable ? true : !isLastSelection;

    return (
      <OptionButton
        key={`chk-${index}`}
        ctx={{ items, index }}
        kind={'checkbox'}
        item={option}
        isSelected={isSelected}
        isEnabled={props.isEnabled}
        canDeselect={canDeselect}
        factory={props.factory}
        onClick={props.onClick}
      />
    );
  });

  const styles = { base: css({ position: 'relative' }) };
  return <div {...css(styles.base, props.style)}>{elOptions}</div>;
};

/**
 * [Helpers]
 */

const Helpers = {
  toItems(options?: (OptionItem | string)[]): OptionItem[] {
    if (options === undefined) return [];
    return options.map((input) => Helpers.toItem(input));
  },

  toItem(input: string | OptionItem): OptionItem {
    return typeof input === 'object' ? input : { label: input, value: input };
  },

  toSingleSelected(items: OptionItem[], input?: OptionItem | number): OptionItem | undefined {
    if (input === undefined) return undefined;
    if (typeof input === 'number') return items[input];
    return Helpers.toItem(input);
  },

  toMultiSelected(
    items: OptionItem[],
    input?: OptionItem | OptionItem[] | number | number[],
  ): OptionItem[] {
    if (input === undefined) return [];
    const list = Array.isArray(input) ? input : [input];
    return list.map((value) => (typeof value === 'number' ? items[value] : value)).filter(Boolean);
  },

  isSelected(option: OptionItem<any>, selected?: OptionItem<any>) {
    return selected === undefined ? option.value === undefined : option.value === selected.value;
  },

  isAnySelected(option: OptionItem<any>, selected: OptionItem<any>[]) {
    return selected.some((item) => Helpers.isSelected(option, item));
  },
};
