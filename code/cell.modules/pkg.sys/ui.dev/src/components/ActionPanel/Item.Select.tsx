import React, { useState, useRef } from 'react';
import Select from 'react-select';

import { color, css, CssValue, t, time } from '../../common';
import { useItemMonitor } from '../../hooks/Actions';
import { ButtonView } from './Item.ButtonView';
import { Icons } from '../Icons';

export type ItemSelectProps = {
  ns: string;
  bus: t.DevEventBus;
  model: t.DevActionSelect;
  style?: CssValue;
};

export const ItemSelect: React.FC<ItemSelectProps> = (props) => {
  const { bus, ns } = props;
  const model = useItemMonitor({ bus, model: props.model });

  const { label, description } = model;
  const isActive = Boolean(model.handler);
  // const value = Boolean(model.current);

  const [isSelectVisible, setIsSelectVisible] = useState<boolean>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const focus = () => time.delay(0, () => selectRef.current?.focus());
  const blur = () => time.delay(0, () => selectRef.current?.blur());

  const hideSelect = () => {
    setIsMenuOpen(false);
    setIsSelectVisible(false);
    blur();
  };

  const showSelect = () => {
    setIsSelectVisible((prev) => !prev);
    setIsMenuOpen(true);
    focus();
  };

  const selectRef = useRef<Select>();

  const handleSelectBlur = () => {
    setIsSelectVisible(false);
  };

  const handleChange = (...args: any[]) => {
    console.log('args', args);
    hideSelect();
  };

  const styles = {
    base: css({ position: 'relative' }),
    select: {
      outer: css({
        Absolute: [-5, 0, null, 0],
        paddingLeft: 36,
        paddingRight: 15,
        display: isSelectVisible ? 'block' : 'none',
        zIndex: 9999,
      }),
      inner: css({
        boxShadow: `0 1px 8px 0 ${color.format(-0.25)}`,
      }),
    },
  };

  const options = [
    { value: { foo: 'chocolate' }, label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];

  const elSelect = (
    <div {...styles.select.outer}>
      <div {...styles.select.inner}>
        <Select
          ref={(e) => (selectRef.current = (e as unknown) as Select)}
          options={options}
          placeholder={label}
          menuIsOpen={isMenuOpen}
          isMulti={true}
          onBlur={handleSelectBlur}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const elExpandIcon = <Icons.Chevron.Down />;

  return (
    <div {...css(styles.base, props.style)}>
      <ButtonView
        label={label}
        description={description}
        isActive={isActive}
        right={elExpandIcon}
        // style={props.style}
        onClick={showSelect}
      />
      {elSelect}
    </div>
  );
};
