import React from 'react';
import { css, CssValue, COLORS } from '../../common';
import { Icons } from '../Icons';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

export type ActionPanelProps = { style?: CssValue };

export const ActionPanel: React.FC<ActionPanelProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      userSelect: 'none',
      Scroll: true,
    }),
    body: css({
      fontSize: 14,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        <div>panel</div>

        <Icons.Variable color={COLORS.CLI.MAGENTA} />

        <div>
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
          {LOREM}
        </div>
      </div>
    </div>
  );
};
