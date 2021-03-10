import React from 'react';

import { color, COLORS, css, CssValue, t, WebRuntime } from '../../common';
import { ActionsSelector } from '../ActionsSelector';
import { Icons } from '../Icons';

export type HarnessFooterProps = {
  bus: t.EventBus<any>;
  actions: t.Actions[];
  selected?: t.Actions;
  style?: CssValue;
};

export const HarnessFooter: React.FC<HarnessFooterProps> = (props) => {
  const { bus, selected, actions } = props;
  const isEmpty = actions.length === 0;

  const model = selected?.toObject();
  const env = { ...model?.env.viaSubject, ...model?.env.viaAction };

  const labelColor = env.layout?.labelColor || -0.5;
  const buttonOverColor = COLORS.BLUE;

  selected?.renderSubject();

  const styles = {
    base: css({
      Flex: 'horizontal-spaceBetween-stretch',
      color: color.format(labelColor),
      userSelect: 'none',
    }),
    actionsSelector: css({ position: 'relative' }),
    module: {
      base: css({ Flex: 'center-center' }),
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
    <div {...styles.module.base}>
      <Icons.Package
        size={22}
        style={{ marginRight: 4, opacity: 0.7 }}
        color={color.format(labelColor)}
      />
      <div {...styles.module.label}>
        <div>{WebRuntime.module.name}</div>
        <div {...styles.module.version}>{WebRuntime.module.version}</div>
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      <div>{elActionsSelector}</div>
      <div>{elModule}</div>
    </div>
  );
};
