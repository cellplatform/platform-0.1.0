import React from 'react';

import { css, CssValue, defaultValue, R } from '../../common';
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
  const items = toItems(props.items);
  const selected = toSingleSelected(items, props.selected);
  const isClearable = defaultValue(props.isClearable, false);

  const elOptions = items.map((option, index) => {
    const isSelected = R.equals(option, selected);
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
  const items = toItems(props.items);
  const selected = toMultiSelected(items, props.selected);
  const isClearable = defaultValue(props.isClearable, true);

  const elOptions = items.map((option, index) => {
    const isSelected = selected.some((item) => R.equals(item, option));
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

function toItems(options?: (OptionItem | string)[]): OptionItem[] {
  if (options === undefined) return [];
  return options.map((input) => toItem(input));
}

function toItem(input: string | OptionItem): OptionItem {
  return typeof input === 'object' ? input : { label: input, value: input };
}

function toSingleSelected(
  items: OptionItem[],
  input?: OptionItem | number,
): OptionItem | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'number') return items[input];
  return toItem(input);
}

function toMultiSelected(
  items: OptionItem[],
  input?: OptionItem | OptionItem[] | number | number[],
): OptionItem[] {
  if (input === undefined) return [];
  const list = Array.isArray(input) ? input : [input];
  return list.map((value) => (typeof value === 'number' ? items[value] : value)).filter(Boolean);
}
