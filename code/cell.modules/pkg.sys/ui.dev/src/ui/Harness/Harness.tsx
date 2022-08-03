import React, { useEffect, useState } from 'react';

import { css, CssValue, rx, t } from '../../common';
import { useActionsPropertyInput, useActionsRedraw, useSelectionManager } from '../../ui.hooks';
import { ErrorBoundary } from '../ErrorBoundary';
import { Host } from '../Host';
import { HarnessActions } from './Harness.Actions';
import { HarnessEmpty } from './Harness.Empty';
import { HarnessFooter } from './Harness.Footer';

export type HarnessProps = {
  bus?: t.EventBus<any>;
  actions?: t.ActionsSet;
  allowRubberband?: boolean; // Page rubber-band effect in Chrome (default: false).
  showActions?: boolean;
  style?: CssValue;
};

export const Harness: React.FC<HarnessProps> = (props) => {
  const [bus, setBus] = useState<t.EventBus>(props.bus || rx.bus());

  /**
   * TODO 🐷
   * - Handle showActions/fullscreen in Harness model (when that comes).
   */
  const [showActions, setShowActions] = useState<boolean>(props.showActions ?? true);

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    if (props.bus) setBus(props.bus);
  }, [props.bus]);

  useEffect(() => {
    const allowRubberband = props.allowRubberband ?? false;
    document.body.style.overflow = allowRubberband ? 'auto' : 'hidden';
  }, [props.allowRubberband]);

  const actions = useActionsPropertyInput(props.actions);
  const selectionManager = useSelectionManager({ bus, actions: actions.items });
  const selected = selectionManager.selected;
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
  const actionsEdge = envActions.edge ?? 'right';

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, Flex: 'horizontal-stretch-stretch' }),
    main: css({ position: 'relative', flex: 1 }),
    host: css({ Absolute: 0, boxSizing: 'border-box', display: 'flex' }),
    footer: css({
      Absolute: [null, 0, 0, 0],
      pointerEvents: 'none',
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
      actions={actions.items}
      selected={selected}
      style={styles.footer}
    />
  );

  const elActions = selected && showActions && (
    <HarnessActions bus={bus} actions={selected} edge={actionsEdge} />
  );
  const elLeft = actionsEdge === 'left' && elActions;
  const elRight = actionsEdge === 'right' && elActions;

  const handleFullscreenClick = () => setShowActions((prev) => !prev);

  const elHost = (
    <ErrorBoundary>
      <Host
        bus={bus}
        actions={selected}
        style={styles.host}
        actionsOnEdge={actionsEdge}
        actionsVisible={
          showActions === undefined
            ? undefined
            : { value: showActions, onClick: handleFullscreenClick }
        }
      />
    </ErrorBoundary>
  );

  const elMain = (
    <div {...styles.main}>
      {elHost}
      {elFooter}
    </div>
  );

  const elHarness = actions.isEmpty === false && (
    <>
      {elLeft}
      {elMain}
      {elRight}
    </>
  );

  const elEmpty = actions.isEmpty && (
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
