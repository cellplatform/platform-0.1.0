import React, { useState, useRef } from 'react';
import SelectComponent from 'react-select';

import { color, css, CssValue, t, time } from '../../common';
import { useItemMonitor } from '../../hooks/Actions';
import { ButtonView } from './Item.ButtonView';
import { Icons } from '../Icons';
import { Select } from '../../api/Actions.Item';

export type ItemSelectProps = {
  namespace: string;
  bus: t.EventBus;
  model: t.ActionSelect;
  style?: CssValue;
};

export const ItemSelect: React.FC<ItemSelectProps> = (props) => {
  const { namespace } = props;
  const model = useItemMonitor({ bus: props.bus, model: props.model });
  const bus = props.bus.type<t.ActionEvent>();

  const { label, description } = model;
  const isActive = model.handlers.length > 0;
  const options = model.items.map((v) => Select.toOption(v));
  const current = model.multi ? model.current : model.current[0];

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

  const selectRef = useRef<SelectComponent>();

  const handleSelectBlur = () => {
    setIsSelectVisible(false);
  };

  const handleChange = (value: any, meta: { action: t.SelectActionTypes }) => {
    hideSelect();
    const { action } = meta;
    const next = (Array.isArray(value) ? value : [value]) as t.ActionSelectItem[];
    bus.fire({
      type: 'dev:action/Select',
      payload: { namespace, model, changing: { action, next } },
    });
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

  const elSelect = (
    <div {...styles.select.outer}>
      <div {...styles.select.inner}>
        <SelectComponent
          ref={(e) => (selectRef.current = (e as unknown) as SelectComponent)}
          options={options}
          value={current}
          placeholder={label}
          menuIsOpen={isMenuOpen}
          isMulti={model.multi}
          isClearable={model.clearable}
          onBlur={handleSelectBlur}
          onChange={handleChange}
        />
      </div>
    </div>
  );

  const elExpandIcon = <Icons.Chevron.Down size={20} />;

  return (
    <div {...css(styles.base, props.style)}>
      <ButtonView
        label={label}
        description={description}
        placeholder={model.placeholder}
        isActive={isActive}
        right={elExpandIcon}
        onClick={showSelect}
      />
      {elSelect}
    </div>
  );
};
