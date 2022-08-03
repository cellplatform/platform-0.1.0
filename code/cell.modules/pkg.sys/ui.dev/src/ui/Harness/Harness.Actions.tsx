import React from 'react';

import { css, t, color, CssValue } from '../../common';
import { useActionsRedraw } from '../../ui.hooks';

export type HarnessActionsProps = {
  bus: t.EventBus;
  actions?: t.Actions;
  edge?: t.HostedActionsEdge;
  style?: CssValue;
};

/**
 * A wrapper around the <ActionPanel> that handles triggoring redraws when
 * relevant state changes.
 */
export const HarnessActions: React.FC<HarnessActionsProps> = (props) => {
  const { bus, actions, edge } = props;

  useActionsRedraw({
    name: '<HarnessActions>',
    paths: ['ctx/current', 'env/viaAction'],
    bus,
    actions,
  });

  if (!actions) return null;

  /**
   * NOTE
   *    The host/layout settings are assigned in the [renderSubject] handler
   *    and are overridden by any host/layout settings that may be incrementally
   *    assigned via executed Action handlers.
   */
  const env = actions.toObject().env;
  const settings = { ...env.viaSubject.actions, ...env.viaAction.actions };

  const border = settings.border ?? -0.08;
  const borderColor = Array.isArray(border) ? border[0] : border;
  const borderWidth = Array.isArray(border) ? border[1] : 1;
  const borderStyle = `solid ${borderWidth}px ${color.format(borderColor)}`;

  const styles = {
    base: css({
      display: 'flex',
      position: 'relative',
      width: settings.width ?? 300,
      backgroundColor: color.format(settings.background ?? 1),
      borderLeft: edge === 'right' && borderStyle,
      borderRight: edge === 'left' && borderStyle,
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {actions.renderActionPanel(bus, {
        scrollable: true, // default: true
        style: { flex: 1 },
      })}
    </div>
  );
};
