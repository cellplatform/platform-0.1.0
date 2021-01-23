import React from 'react';

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
    left: css({
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
      Absolute: [100, 50, 50, 50],
      border: `solid 5px ${color.format(-0.1)}`,
      boxSizing: 'border-box',
    }),
  };

  const elActions = actions.renderList(bus, {
    scrollable: true, // default: true
    style: { flex: 1 },
  });

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <ActionsHost bus={bus} actions={actions} style={styles.host} background={-0.04} />
        </div>
        <div {...styles.right}>{elActions}</div>
      </div>
    </React.StrictMode>
  );
};
