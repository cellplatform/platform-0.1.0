import React from 'react';
import { css, CssValue, t, defaultValue } from '../../common';

import { Host } from '../Host';
import { ActionsSelector, useActionsSelectorState } from '../ActionsSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import { Store } from '../../store';
import { HarnessActions } from './HarnessActions';
import { useActionsRedraw } from '../../components.hooks';

export type HarnessProps = {
  bus: t.EventBus;
  actions?: t.Actions | t.Actions[];
  store?: t.ActionsSelectStore | boolean;
  namespace?: string;
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const { bus } = props;
  const store = toStore(props.namespace, asActionsArray(props.actions), props.store);
  const actions = useActionsSelectorState({ bus, store, actions: asActionsArray(props.actions) });

  const selected = actions.selected;
  selected?.renderSubject();

  const env = selected?.toObject().env;
  const actionsSettings = { ...env?.viaSubject.actions, ...env?.viaAction.actions };
  const actionsEdge = defaultValue(actionsSettings.edge, 'right');

  useActionsRedraw({
    name: '<Harness>',
    paths: [(path) => Boolean(path.match(/^env\/.*\/actions\/edge/))],
    bus,
    actions: selected,
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
    host: css({
      Absolute: 0,
      boxSizing: 'border-box',
      display: 'flex',
    }),
    actionsSelector: css({
      Absolute: [null, null, 20, 20],
      width: 300,
    }),
  };

  const elActionsSelector = actions.list.length > 1 && (
    <ActionsSelector
      bus={bus}
      selected={selected}
      actions={actions.list}
      menuPlacement={'top'}
      style={styles.actionsSelector}
    />
  );

  const elActions = selected && <HarnessActions bus={bus} actions={selected} edge={actionsEdge} />;
  const elLeft = actionsEdge === 'left' && elActions;
  const elRight = actionsEdge === 'right' && elActions;

  const elMain = (
    <div {...styles.main}>
      <ErrorBoundary>
        <Host bus={bus} actions={selected} style={styles.host} />
      </ErrorBoundary>
      {elActionsSelector}
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

export function asActionsArray(input?: t.Actions | t.Actions[]): t.Actions[] {
  return input === undefined ? [] : Array.isArray(input) ? input : [input];
}
