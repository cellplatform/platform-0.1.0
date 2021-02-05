import React, { useState } from 'react';

import { color, css, rx, t } from '../common';
import { ActionsHost } from '../components/Host';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ActionsSelect } from '../components/ActionsSelect';
import { useActionsSelectState } from '../hooks/Actions';
import * as sample1 from './sample-1/Component.DEV';
import * as sample2 from './sample-2/Component.DEV';

const bus = rx.bus();

bus.event$.subscribe((e) => {
  // console.log('e', e);
});

const actionsList = [sample1.actions, sample2.actions];

const selectedState: t.ActionsSelectedState = async (value) => {
  const KEY = 'DEV/actions/selected';
  if (value !== undefined) localStorage.setItem(KEY, value.toObject().ns);
  return actionsList.find((actions) => actions.toObject().ns === localStorage.getItem(KEY));
};

export const Dev: React.FC = () => {
  const actions = useActionsSelectState({
    bus,
    actions: actionsList,
    selectedState,
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

  const elActionsList = actions.selected?.renderList(bus, {
    scrollable: true, // default: true
    style: { flex: 1 },
  });

  const elSelect = (
    <ActionsSelect
      bus={bus}
      selected={actions.selected}
      actions={actions.list}
      // onChange={(e) => setSelectedActions(e.selected)}
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
        <div {...styles.right}>{elActionsList}</div>
      </div>
    </React.StrictMode>
  );
};
