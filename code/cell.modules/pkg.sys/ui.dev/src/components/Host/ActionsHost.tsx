import React from 'react';

import { t, CssValue } from '../../common';
import { useRedraw } from '../../hooks/Actions';
import { Host } from './Host';

export type ActionHostProps = {
  bus: t.EventBus;
  actions?: t.DevActions<any>;
  style?: CssValue;
};

/**
 * A wrapper around <Host> that handles triggoring redraws when
 * the [Actions] context data changes.
 */
export const ActionsHost: React.FC<ActionHostProps> = (props) => {
  const { actions } = props;

  useRedraw({
    name: '<ActionsHost>',
    paths: ['ctx/current', 'env/viaAction'],
    bus: props.bus.type<t.DevActionEvent>(),
    actions,
  });

  if (!actions) return null;

  const subject = actions.renderSubject();
  const env = actions.toObject().env;

  /**
   * NOTE
   *    The host/layout settings assigned in the [renderSubject] handler
   *    are overridden by any host/layout settings incrementally assigned
   *    via executed Action handlers.
   */
  const host = { ...env.viaSubject.host, ...env.viaAction.host };

  return <Host {...props} subject={subject} host={host} />;
};
