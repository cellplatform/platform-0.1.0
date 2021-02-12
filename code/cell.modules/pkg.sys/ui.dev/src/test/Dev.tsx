import React from 'react';

import { ActionsHost, ActionsSelect, ErrorBoundary, Store, useActionsSelectState } from '..';
import { color, css, rx, HttpClient } from '../common';
import * as sample1 from './sample-1/Component.DEV';
import * as sample2 from './sample-2/Component.DEV';
import * as sample3 from './sample-3/Component.DEV';

const bus = rx.bus();

bus.event$.subscribe((e) => {
  // console.log('e', e);
});

const client = HttpClient.create(5000);

const list = [sample1.actions, sample2.actions, sample3.actions];

export const Dev: React.FC = () => {
  const actions = useActionsSelectState({
    bus,
    actions: list,
    // store: Store.ActionsSelect.cell({
    //   client,
    //   uri: 'cell:ckkynysav001hrret8tzzg2pp:A1',
    //   actions: list,
    // }),
    store: Store.ActionsSelect.localStorage({ actions: list }),
  });

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

  const elActions = actions.selected?.renderActionPanel(bus, {
    scrollable: true, // default: true
    style: { flex: 1 },
  });

  const elSelect = (
    <ActionsSelect
      bus={bus}
      selected={actions.selected}
      actions={actions.list}
      menuPlacement={'top'}
      style={styles.select.outer}
    />
  );

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.main}>
          <ErrorBoundary>
            <ActionsHost bus={bus} actions={actions.selected} style={styles.host} />
          </ErrorBoundary>
          {elSelect}
        </div>
        <div {...styles.right}>{elActions}</div>
      </div>
    </React.StrictMode>
  );
};
