import React, { useEffect, useRef, useState } from 'react';
import { css, CssValue, t, color } from '../../common';

import { ActionsHost } from '../Host';
import { ActionsSelector, useActionsSelectorState } from '../ActionsSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import { Store } from '../../store';

export type HarnessActionsEdge = 'left' | 'right';
export type HarnessActions = { edge?: HarnessActionsEdge };

export type HarnessProps = {
  bus: t.EventBus;
  actions?: t.Actions[];
  actionsStyle?: HarnessActions;
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const { bus, actionsStyle = {} } = props;
  const { edge: actionsEdge = 'right' } = actionsStyle;

  type TMP = { list: t.Actions[]; selected?: t.Actions };
  const actions: TMP = { list: [], selected: undefined };
  // const actions = useActionsSelectorState({
  //   bus: props.bus,
  //   actions: props.actions,
  //   // store: Store.ActionsSelect.cell({
  //   //   client,
  //   //   uri: 'cell:ckkynysav001hrret8tzzg2pp:A1',
  //   //   actions: list,
  //   // }),
  //   store: Store.ActionsSelect.localStorage({ actions: props.actions }),
  // });

  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    main: css({
      position: 'relative',
      flex: 1,
    }),
    left: css({
      borderRight: `solid 1px ${color.format(-0.08)}`,
    }),
    right: css({
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    edge: css({
      display: 'flex',
      position: 'relative',
      width: 300,
      backgroundColor: color.format(-0.03),
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

  const elSelect = actions.list.length > 0 && (
    <ActionsSelector
      bus={bus}
      selected={actions.selected}
      actions={actions.list}
      menuPlacement={'top'}
      style={styles.select.outer}
    />
  );

  const elLeft = actionsEdge === 'left' && (
    <div {...css(styles.edge, styles.left)}>{elActions}</div>
  );
  const elRight = actionsEdge === 'right' && (
    <div {...css(styles.edge, styles.right)}>{elActions}</div>
  );

  const elMain = (
    <div {...styles.main}>
      <ErrorBoundary>
        <ActionsHost bus={bus} actions={actions.selected} style={styles.host} />
      </ErrorBoundary>
      {elSelect}
    </div>
  );

  return (
    <React.StrictMode>
      <div {...css(styles.base, props.style)}>
        {elLeft}
        {elMain}
        {elRight}
      </div>
    </React.StrictMode>
  );
};
