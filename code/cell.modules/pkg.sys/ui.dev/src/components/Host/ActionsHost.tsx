import React from 'react';

import { t } from '../../common';
import { useRedraw } from '../../hooks/actions';
import { Host, HostProps } from './Host';

export type ActionHostProps = HostProps & {
  bus: t.EventBus;
  actions: t.DevActions<any>;
};

/**
 * A wrapper around <Host> that handles triggoring redraws when
 * the [Actions] context data changes.
 */
export const ActionsHost: React.FC<ActionHostProps> = (props) => {
  const { actions } = props;
  const bus = props.bus.type<t.DevActionEvent>();
  useRedraw({ bus, actions });
  return <Host {...props} subject={actions.renderSubject()} />;
};
