import React from 'react';
import { css, CssValue, t, color, defaultValue } from '../../common';

import { ActionsHost } from '../Host';
import { ActionsSelector, useActionsSelectorState } from '../ActionsSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import { Store } from '../../store';

export type HarnessActionsEdge = 'left' | 'right';
export type HarnessActionsProps = {
  edge?: HarnessActionsEdge;
  width?: number;
  background?: string | number;
};

export type HarnessHostProps = { background?: string | number };

export type HarnessProps = {
  bus: t.EventBus;
  actions?: t.Actions[];
  actionsStyle?: HarnessActionsProps;
  hostStyle?: HarnessHostProps;
  store?: t.ActionsSelectStore | boolean;
  namespace?: string;
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const { bus, actionsStyle = {}, hostStyle = {} } = props;
  const { edge: actionsEdge = 'right' } = actionsStyle;
  const store = toStore(props.namespace, props.actions, props.store);

  const actions = useActionsSelectorState({
    bus,
    actions: props.actions,
    store,
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
    left: css({
      borderRight: `solid 1px ${color.format(-0.08)}`,
    }),
    right: css({
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    edge: css({
      display: 'flex',
      position: 'relative',
      width: defaultValue(actionsStyle.width, 300),
      backgroundColor: color.format(defaultValue(actionsStyle.background, -0.03)),
    }),
    host: css({
      Absolute: 0,
      boxSizing: 'border-box',
      backgroundColor: color.format(defaultValue(hostStyle.background, 1)),
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

/**
 * [Helpers]
 */

function toStore(
  namespace?: string,
  actions?: t.Actions[],
  store?: t.ActionsSelectStore | boolean,
): t.ActionsSelectStore | undefined {
  if (typeof store === 'function') return store;
  return store === false ? undefined : Store.ActionsSelect.localStorage({ namespace, actions });
}
