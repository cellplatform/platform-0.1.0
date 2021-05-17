import React from 'react';

import { color, COLORS, css, SelectUtil, t, R, constants } from '../common';
import { Icons } from '../Icons';
import { Button } from '../Primitives';
import { Radios, Checkboxes } from '../OptionButtons';
import { Layout, LayoutTitle } from './Layout';

export type SelectButtonsProps = { namespace: string; bus: t.EventBus; item: t.ActionSelect };

export const SelectButtons: React.FC<SelectButtonsProps> = (props) => {
  const { namespace, item } = props;
  const bus = props.bus as t.EventBus<t.DevActionEvent>;

  const { title, label, description, isSpinning, multi, indent } = item;
  const isActive = item.handlers.length > 0;
  const options = item.items.map((value) => SelectUtil.toItem(value));
  const current = Array.isArray(item.current) ? item.current : [item.current];

  const styles = {
    base: css({ position: 'relative' }),
    body: css({
      position: 'relative',
      marginTop: label === undefined ? -1 : 8,
    }),
  };

  const fireSelect = (next: t.ActionSelectItem[]) => {
    bus.fire({
      type: 'sys.ui.dev/action/Select',
      payload: { namespace, item, changing: { next } },
    });
  };

  const elTitle = title && <LayoutTitle>{title}</LayoutTitle>;

  const elRadios = !multi && (
    <Radios
      items={options}
      selected={current[0]}
      isClearable={item.clearable}
      factory={{
        label(props) {
          return <Label {...props} />;
        },
      }}
      onClick={(e) => {
        if (e.action.select) {
          fireSelect([e.item]);
        }
        if (e.action.deselect && item.clearable) {
          fireSelect([]);
        }
      }}
    />
  );

  const elCheckboxes = multi && (
    <Checkboxes
      items={options}
      selected={current}
      isClearable={item.clearable}
      factory={{
        label(props) {
          return <Label {...props} />;
        },
      }}
      onClick={(e) => {
        if (e.action.select) {
          fireSelect(R.uniq([...current, e.item]));
        }
        if (e.action.deselect) {
          const next = current.filter((item) => !R.equals(e.item, item));
          fireSelect(next);
        }
      }}
    />
  );

  const elBody = (
    <div {...styles.body}>
      {elRadios}
      {elCheckboxes}
    </div>
  );

  const elClear = item.clearable && (
    <Button onClick={() => fireSelect([])}>
      <Icons.Close size={18} />
    </Button>
  );

  return (
    <div {...styles.base}>
      <Layout
        isActive={isActive}
        isSpinning={isSpinning}
        label={{
          body: label,
          color: COLORS.DARK,
        }}
        body={elBody}
        icon={{
          Component: Icons.Checklist,
          color: color.alpha(COLORS.DARK, 0.4),
          size: 19,
        }}
        description={description}
        placeholder={item.isPlaceholder}
        top={elTitle}
        right={elClear}
        indent={indent}
      />
    </div>
  );
};

type LabelProps = { label: string; isSelected?: boolean };
const Label: React.FC<LabelProps> = (props) => {
  const styles = {
    base: css({
      fontSize: 12,
      fontFamily: constants.FONT.MONO,
      opacity: props.isSelected ? 1 : 0.6,
      flex: 1,
      height: 16,
      Flex: 'center-stretch',
    }),
  };
  return <div {...styles.base}>{props.label}</div>;
};
