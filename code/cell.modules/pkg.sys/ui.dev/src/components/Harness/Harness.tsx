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
  allowRubberband?: boolean; // Page rubber-band effect in Chrome. Default:false.
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const [bus, setBus] = useState<t.EventBus>(props.bus || rx.bus());
  const allowRubberband = defaultValue(props.allowRubberband, false);

  useEffect(() => {
    if (props.bus) setBus(props.bus);
  }, [props.bus]);

  useEffect(() => {
    document.body.style.overflow = allowRubberband ? 'auto' : 'hidden';
  }, [allowRubberband]);

  const store = toStore(props.namespace, asActionsArray(props.actions), props.store);
  const actions = useActionsSelectorState({ bus, store, actions: asActionsArray(props.actions) });

  const selected = actions.selected;
  selected?.renderSubject();

  useActionsRedraw({
    name: '<Harness>',
    paths: [
      (path) => Boolean(path.match(/^env\/.*\/actions\/edge/)),
      (path) => Boolean(path.match(/^env\/via(Subject|Action)\//)),
    ],
    bus,
    actions: selected,
  });

  const env: t.ActionsModelEnv = selected?.toObject().env || { viaSubject: {}, viaAction: {} };
  const envActions = { ...env?.viaSubject.actions, ...env?.viaAction.actions };
  const actionsEdge = defaultValue(envActions.edge, 'right');

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
    footer: css({
      Absolute: [null, 0, 0, 0],
      height: 34,
      paddingTop: 6,
      paddingRight: 12,
      paddingBottom: 6,
      paddingLeft: 10,
      display: 'flex',
    }),
  };

  const elFooter = (
    <HarnessFooter
      bus={bus}
      env={env}
      actions={actions.list}
      selected={selected}
      style={styles.footer}
    />
  );

  const elActions = selected && <HarnessActions bus={bus} actions={selected} edge={actionsEdge} />;
  const elLeft = actionsEdge === 'left' && elActions;
  const elRight = actionsEdge === 'right' && elActions;

  const elHost = (
    <ErrorBoundary>
      <Host bus={bus} actions={selected} style={styles.host} />
    </ErrorBoundary>
  );

  const elMain = (
    <div {...styles.main}>
      {elHost}
      {elFooter}
    </div>
  );

  const elHarness = !actions.empty && (
    <>
      {elLeft}
      {elMain}
      {elRight}
    </>
  );

  const elEmpty = actions.empty && (
    <>
      <HarnessEmpty />
      {elFooter}
    </>
  );

  return (
    <React.StrictMode>
      <div {...css(styles.base, props.style)}>
        {elHarness}
        {elEmpty}
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
