import React from 'react';

import { color, COLORS, css, CssValue, log, t, MODULE } from '../../common';
import { ActionsSelector } from '../ActionsSelector';
import { Icons } from '../Icons';

export type HarnessFooterProps = {
  bus: t.EventBus<any>;
  env: t.ActionsModelEnv;
  actions: t.Actions[];
  selected?: t.Actions;
  style?: CssValue;
};

export const HarnessFooter: React.FC<HarnessFooterProps> = (props) => {
  const { bus, selected, actions } = props;
  const isEmpty = actions.length === 0;

  const envLayout = { ...props.env.viaSubject.layout, ...props.env.viaAction.layout };
  const labelColor = envLayout.labelColor ?? -0.5;
  const buttonOverColor = COLORS.BLUE;

  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      userSelect: 'none',
      color: color.format(labelColor),
      display: 'flex',
    }),
    bg: css({ Absolute: 0 }),
    body: css({
      Absolute: 0,
      Flex: 'horizontal-spaceBetween-center',
    }),
    actionsSelector: css({
      position: 'relative',
      pointerEvents: 'auto',
      marginLeft: 15,
    }),
    module: {
      base: css({ Flex: 'center-center', marginRight: 10 }),
      label: css({ position: 'relative', fontSize: 11, textAlign: 'right' }),
      version: css({ fontSize: 8 }),
    },
  };

  const elActionsSelector = !isEmpty && (
    <ActionsSelector
      bus={bus}
      actions={actions}
      selected={selected}
      menuPlacement={'top'}
      style={styles.actionsSelector}
      buttonColor={labelColor}
      buttonOverColor={buttonOverColor}
    />
  );

  const elModule = (
    <div {...styles.module.base} onClick={logRuntime}>
      <div {...styles.module.label}>
        <div>{MODULE.info.name}</div>
        <div {...styles.module.version}>{MODULE.info.version}</div>
      </div>
      <Icons.Compose.Solid
        size={24}
        style={{ marginLeft: 4, opacity: 0.8 }}
        color={color.format(labelColor)}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.bg} />
      <div {...styles.body}>
        <div>{elActionsSelector}</div>
        <div>{elModule}</div>
      </div>
    </div>
  );
};

/**
 * [Helpers]
 */

function logRuntime() {
  log.group('🌳 Runtime');
  log.info('module:', MODULE.info);
  log.groupEnd();
}
