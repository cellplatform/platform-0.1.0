import React from 'react';
import { css, CssValue, COLORS, t, constants, defaultValue } from '../../common';
import { Icons } from '../Icons';
import { ActionBuilder } from '../../config';
import { ActionPanelTitle } from './ActionPanelTitle';

export type ActionPanelProps = {
  style?: CssValue;
  actions?: t.ActionModelBuilder<any> | t.ActionModel<any> | t.ActionModelState<any>;
  showTitle?: boolean;
};

export const Component: React.FC<ActionPanelProps> = (props) => {
  const model = ActionBuilder.toModel(props.actions) || ActionBuilder.model().state;
  const styles = {
    base: css({
      Scroll: true,
      position: 'relative',
      userSelect: 'none',
      fontFamily: constants.FONT.SANS,
    }),
    body: css({
      fontSize: 14,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {defaultValue(props.showTitle, true) && <ActionPanelTitle>{model.name}</ActionPanelTitle>}

        <Icons.Variable color={COLORS.CLI.MAGENTA} size={20} />
      </div>
    </div>
  );
};

/**
 * Attach additional properties to the component.
 */
type A = React.FC<ActionPanelProps> & { build: t.ActionModelFactory['builder'] };
(Component as A).build = ActionBuilder.builder;
export const ActionPanel = Component as A;
export default ActionPanel;
