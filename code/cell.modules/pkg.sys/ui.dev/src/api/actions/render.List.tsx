import React from 'react';

import { rx, t } from './common';
import { ActionPanel } from '../../ui/ActionPanel';

/**
 * Renders the <ActionPanel> list component.
 */
export function renderList(args: {
  bus: t.EventBus;
  props?: t.ActionPanelProps;
  actions: t.Actions;
}) {
  const { bus, actions, props = {} } = args;
  if (!rx.isBus(bus)) throw new Error(`Event bus not provided`);
  return <ActionPanel {...props} bus={bus} actions={actions} />;
}
