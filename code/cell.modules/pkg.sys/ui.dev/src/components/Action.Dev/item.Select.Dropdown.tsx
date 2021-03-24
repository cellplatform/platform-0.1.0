import React, { useRef, useState } from 'react';
import Dropdown from 'react-select';

import { color, css, SelectUtil, t, time } from '../common';
import { Icons } from '../Icons';
import { Layout, LayoutTitle, LayoutLabel } from './Layout';

export type SelectDropdownProps = {
  namespace: string;
  bus: t.EventBus;
  item: t.ActionSelect;
};

export const SelectDropdown: React.FC<SelectDropdownProps> = (props) => {
  const { namespace, item } = props;
  const bus = props.bus.type<t.DevActionEvent>();

  const { title, label, description, isSpinning } = item;
  const isActive = item.handlers.length > 0;
  const options = item.items.map((value) => SelectUtil.toOption(value));
  const current = item.multi ? item.current : item.current[0];

  const [isSelectVisible, setIsSelectVisible] = useState<boolean>();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const focus = () => time.delay(0, () => selectRef.current?.focus());
  const blur = () => time.delay(0, () => selectRef.current?.blur());

  const hideDropdown = () => {
    setIsMenuOpen(false);
    setIsSelectVisible(false);
    blur();
  };

  const showDropdown = () => {
    setIsSelectVisible((prev) => !prev);
    setIsMenuOpen(true);
    focus();
  };

  const selectRef = useRef<Dropdown>();

  const handleSelectBlur = () => {
    setIsSelectVisible(false);
  };

  const handleChange = (value: any, meta: { action: string }) => {
    hideDropdown();
    const next = (Array.isArray(value) ? value : [value]) as t.ActionSelectItem[];
    bus.fire({
      type: 'dev:action/Select',
      payload: { namespace, item, changing: { next } },
    });
  };

  const styles = {
    base: css({ position: 'relative' }),
    dropdown: {
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

  const elDropdown = (
    <div {...styles.dropdown.outer}>
      <div {...styles.dropdown.inner}>
        <Dropdown
          ref={(e) => (selectRef.current = (e as unknown) as Dropdown)}
          options={options}
          value={current}
          placeholder={label}
          menuIsOpen={isMenuOpen}
          isMulti={item.multi}
          isClearable={item.clearable}
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
        label={{ body: label }}
        icon={{ Component: Icons.Checklist }}
        description={description}
        placeholder={item.isPlaceholder}
        top={elTitle}
        right={elExpandIcon}
        onClick={showDropdown}
      />
      {elDropdown}
    </div>
  );
};
