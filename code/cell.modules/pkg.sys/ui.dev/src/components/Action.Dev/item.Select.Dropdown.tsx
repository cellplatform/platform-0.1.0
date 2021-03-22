import React, { useRef, useState } from 'react';
import Dropdown from 'react-select';

import { color, css, SelectUtil, t, time, useActionItemMonitor } from '../common';
import { Icons } from '../Icons';
import { Layout, LayoutTitle } from './Layout';

export type SelectDropdownProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionSelect;
};

export const SelectDropdown: React.FC<SelectDropdownProps> = (props) => {
  const { namespace } = props;
  const model = useActionItemMonitor({ bus: props.bus, item: props.item });
  const bus = props.bus.type<t.DevActionEvent>();

  const { title, label, description, isSpinning } = model;
  const isActive = model.handlers.length > 0;
  const options = model.items.map((v) => SelectUtil.toOption(v));
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

  const selectRef = useRef<Dropdown>();

  const handleSelectBlur = () => {
    setIsSelectVisible(false);
  };

  const handleChange = (value: any, meta: { action: string }) => {
    hideSelect();
    const action = meta.action as t.ActionSelectKind;

    const next = (Array.isArray(value) ? value : [value]) as t.ActionSelectItem[];
    bus.fire({
      type: 'dev:action/Select',
      payload: { namespace, item: model, changing: { action, next } },
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
        <Dropdown
          ref={(e) => (selectRef.current = (e as unknown) as Dropdown)}
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

  const elTitle = title && <LayoutTitle>{title}</LayoutTitle>;
  const elExpandIcon = <Icons.Chevron.Down size={20} />;

  return (
    <div {...styles.base}>
      <Layout
        isActive={isActive}
        isSpinning={isSpinning}
        label={label}
        icon={{ Component: Icons.Checklist }}
        description={description}
        placeholder={model.isPlaceholder}
        top={elTitle}
        right={elExpandIcon}
        onClick={showSelect}
      />
      {elSelect}
    </div>
  );
};
