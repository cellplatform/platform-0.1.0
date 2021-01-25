import React from 'react';

import { t, CssValue } from '../../common';
import { useRedraw } from '../../hooks/actions';
import { Host } from './Host';

export type ActionHostProps = {
  bus: t.EventBus;
  actions: t.DevActions<any>;
  style?: CssValue;
};

/**
 * A wrapper around <Host> that handles triggoring redraws when
 * the [Actions] context data changes.
 */
export const ActionsHost: React.FC<ActionHostProps> = (props) => {
  const { actions } = props;
  const env = actions.toObject().env;
  useRedraw({
    name: '<ActionsHost>',
    bus: props.bus.type<t.DevActionEvent>(),
    actions,
    paths: ['ctx/current', 'env'],
  });
  console.log('RENDER', '<actionsHost>');
  return (
    <Host
      {...props}
      subject={actions.renderSubject()}
      host={env.host}
      layout={env.layout}
      background={env.host?.background}
    />
  );
};
