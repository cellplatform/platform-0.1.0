import React from 'react';

import { t, rx } from '../../common';
import { ActionPanel } from '../../components/ActionPanel';

/**
 * Render the subject(s) under test.
 */
export function renderSubject<Ctx>(args: { ctx: Ctx; factory?: t.DevActionRenderSubject<Ctx> }) {
  type R = t.DevActionSubject;
  const { ctx, factory } = args;
  const res: R = { items: [], layout: {}, orientation: 'y', spacing: 60 };

  if (!ctx) {
    const err = `Cannot [renderSubject] - the Actions [context] has not been set. Make sure you've called [actions.context(...)]`;
    throw new Error(err);
  }

  if (factory) {
    const payload: t.DevActionRenderSubjectArgs<any> = {
      ctx,
      orientation(value, spacing) {
        res.orientation = value;
        if (typeof spacing === 'number') res.spacing = Math.max(0, spacing);
        return payload;
      },
      layout(value) {
        res.layout = value;
        return payload;
      },
      render(el: JSX.Element, layout?: t.IDevHostedLayout) {
        if (el) res.items.push({ el, layout });
        return payload;
      },
    };

    factory(payload);
  }

  return res;
}

/**
 * Renders the <ActionPanel> list component.
 */
export function renderList(args: {
  bus: t.EventBus;
  props?: t.ActionPanelProps;
  actions: t.DevActions<any>;
}) {
  const { bus, actions, props = {} } = args;
  if (!rx.isBus(bus)) throw new Error(`Event bus not provided`);
  return <ActionPanel {...props} bus={bus} actions={actions} />;
}
