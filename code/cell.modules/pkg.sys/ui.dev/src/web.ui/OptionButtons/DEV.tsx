import React, { useEffect, useState } from 'react';
import { DevActions } from '../..';
import { Radios, Checkboxes } from '.';

import { OptionItem } from './types';
import { R, css } from '../../common';

type Ctx = {
  isEnabled: boolean;
  isClearable: boolean;
  type: 'radio' | 'checkbox';
  selected?: number | number[];
  items: (OptionItem | string)[];
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.OptionButtons')
  .context((e) => {
    if (e.prev) return e.prev;
    return {
      isEnabled: true,
      isClearable: true,
      type: 'radio',
      items: ['Chocolate', 'Strawberry', 'Vanilla'],
    };
  })

  .items((e) => {
    e.title('Component');
    e.button('<Radios>', (e) => (e.ctx.type = 'radio'));
    e.button('<Checkboxes>', (e) => (e.ctx.type = 'checkbox'));

    e.hr(1, 0.1);

    e.boolean('isEnabled', (e) => {
      if (e.changing) e.ctx.isEnabled = e.changing.next;
      e.boolean.current = e.ctx.isEnabled;
    });

    e.boolean('isClearable', (e) => {
      if (e.changing) e.ctx.isClearable = e.changing.next;
      e.boolean.current = e.ctx.isClearable;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Selected');

    e.button('undefined', (e) => (e.ctx.selected = undefined));
    e.button('first', (e) => (e.ctx.selected = 0));
    e.button('last', (e) => (e.ctx.selected = e.ctx.items.length - 1));

    e.hr();
  })

  .subject((e) => {
    const { type, items, isEnabled, isClearable } = e.ctx;

    const label = type === 'checkbox' ? '<Checkboxes>' : '<Radios>';

    e.settings({
      host: { background: -0.04 },
      layout: {
        label,
        cropmarks: -0.2,
        width: 200,
      },
    });

    type P = { selected?: number | number[] };

    const SampleRadios: React.FC<P> = (props) => {
      const [selected, setSelected] = useState<number | undefined>();

      useEffect(() => {
        const selected = Array.isArray(props.selected) ? props.selected[0] : props.selected;
        setSelected(selected);
      }, [props.selected]);

      return (
        <Radios
          style={{ flex: 1 }}
          isEnabled={isEnabled}
          items={items}
          selected={selected}
          isClearable={isClearable}
          factory={{
            label(props) {
              if (props.index !== 1) return;
              const styles = {
                base: css({
                  flex: 1,
                  height: 50,
                  fontWeight: props.isSelected ? 'bold' : 'normal',
                  backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
                }),
              };
              return <div {...styles.base}>{props.label}</div>;
            },
          }}
          onClick={(e) => {
            if (e.action.select) setSelected(e.index);
            if (e.action.deselect) setSelected(undefined);
          }}
        />
      );
    };

    const SampleCheckboxes: React.FC<P> = (props) => {
      const [selected, setSelected] = useState<number | number[] | undefined>();
      useEffect(() => setSelected(props.selected), [props.selected]);
      return (
        <Checkboxes
          style={{ flex: 1 }}
          isEnabled={isEnabled}
          items={items}
          selected={selected}
          isClearable={isClearable}
          onClick={(e) => {
            setSelected((prev) => {
              const current = !prev ? [] : Array.isArray(prev) ? prev : [prev];
              if (e.action.select) {
                return R.uniq([...current, e.index]);
              } else {
                return current.filter((index) => !R.equals(e.item, e.items[index]));
              }
            });
          }}
        />
      );
    };

    e.render(
      <>
        {type === 'radio' && <SampleRadios selected={e.ctx.selected} />}
        {type === 'checkbox' && <SampleCheckboxes selected={e.ctx.selected} />}
      </>,
    );
  });

export default actions;
