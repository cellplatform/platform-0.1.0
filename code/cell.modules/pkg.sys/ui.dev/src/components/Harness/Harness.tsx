import React, { useEffect, useState } from 'react';

import { css, CssValue, defaultValue, rx, t } from '../../common';
import { useActionsRedraw } from '../../components.hooks';
import { Store } from '../../store';
import { useActionsSelectorState } from '../ActionsSelector';
import { ErrorBoundary } from '../ErrorBoundary';
import { Host } from '../Host';
import { HarnessActions } from './HarnessActions';
import { HarnessEmpty } from './HarnessEmpty';
import { HarnessFooter } from './HarnessFooter';

export type HarnessProps = {
  bus?: t.EventBus<any>;
  actions?: t.Actions | t.Actions[];
  store?: t.ActionsSelectStore | boolean;
  namespace?: string;
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const [bus, setBus] = useState<t.EventBus>(props.bus || rx.bus());
  useEffect(() => {
    if (props.bus) setBus(props.bus);
  }, [props.bus]);

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
    footer: css({ Absolute: [null, 10, 6, 10] }),
  };

  const elFooter = (
    <HarnessFooter bus={bus} actions={actions.list} selected={selected} style={styles.footer} />
  );

  const elActions = selected && <HarnessActions bus={bus} actions={selected} edge={actionsEdge} />;
  const elLeft = actionsEdge === 'left' && elActions;
  const elRight = actionsEdge === 'right' && elActions;

  const elMain = (
    <div {...styles.main}>
      <ErrorBoundary>
        <Host bus={bus} actions={selected} style={styles.host} />
      </ErrorBoundary>
      {elFooter}
    </div>
  );

  const elHarness = !actions.empty && (
    <div {...css(styles.base, props.style)}>
      {elLeft}
      {elMain}
      {elRight}
    </div>
  );

  const elEmpty = actions.empty && <HarnessEmpty />;

  return (
    <React.StrictMode>
      {elHarness}
      {elEmpty}
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
