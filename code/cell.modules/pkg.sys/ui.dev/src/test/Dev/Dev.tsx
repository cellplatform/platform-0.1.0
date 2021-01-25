import React from 'react';
import Select from 'react-select';

import { color, css, rx } from '../../common';
import { ActionsHost } from '../../components/Host';
import { actions } from './Dev.actions';

const bus = rx.bus();

export const Dev: React.FC = () => {
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    main: css({
      position: 'relative',
      flex: 1,
    }),
    right: css({
      display: 'flex',
      position: 'relative',
      width: 300,
      backgroundColor: color.format(-0.03),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    host: css({
      Absolute: [100, 50, 100, 50],
      border: `solid 5px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
    }),
    select: {
      outer: css({ Absolute: [null, null, 20, 20], width: 200 }),
    },
  };

  const elActions = actions.renderList(bus, {
    scrollable: true, // default: true
    style: { flex: 1 },
  });

  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];

  const elSelect = (
    <div {...styles.select.outer}>
      <Select options={options} menuPlacement={'top'} />
    </div>
  );

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.main}>
          <ActionsHost bus={bus} actions={actions} style={styles.host} background={-0.04} />
          {elSelect}
        </div>
        <div {...styles.right}>{elActions}</div>
      </div>
    </React.StrictMode>
  );
};
