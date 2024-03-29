import React from 'react';

import { t, CssValue } from '../../common';
import { useActionsRedraw } from '../../ui.hooks';
import { HostLayout, ActionsVisible } from './Host.Layout';

export type HostProps = {
  bus: t.EventBus;
  actions?: t.Actions<any>;
  actionsVisible?: ActionsVisible;
  actionsOnEdge: 'left' | 'right';
  style?: CssValue;
};

/**
 * A wrapper around the <HostLayout> that handles triggoring redraws when
 * relevant state changes.
 */
export const Host: React.FC<HostProps> = (props) => {
  const { actions, bus } = props;

  useActionsRedraw({
    name: '<Host>',
    paths: ['ctx/current', 'env/viaAction'],
    bus,
    actions,
  });

  if (!actions) return null;

  const subject = actions.renderSubject();
  const env = actions.toObject().env;

  /**
   * NOTE
   *    The host/layout settings are assigned in the [renderSubject] handler
   *    and are overridden by any host/layout settings that may be incrementally
   *    assigned via executed Action handlers.
   */
  const host = { ...env.viaSubject.host, ...env.viaAction.host };

  return (
    <HostLayout
      {...props}
      env={env}
      subject={subject}
      host={host}
      actionsOnEdge={props.actionsOnEdge}
      actionsVisible={props.actionsVisible}
    />
  );
};
