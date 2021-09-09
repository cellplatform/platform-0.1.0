import React from 'react';
import { css, t, mouseHandlers, SIZE } from './common';
import { Icons } from '../Icons';

export type TreeNodeTwistyFlag = 'OPEN' | 'CLOSED' | null;

export type TreeNodeTwistyProps = {
  node: t.ITreeviewNode;
  theme: t.ITreeNodeTheme;
  twisty?: TreeNodeTwistyFlag;
  colors: t.ITreeviewNodeColors;
  onMouse?: t.TreeNodeMouseEventHandler;
};

export const TreeNodeTwisty: React.FC<TreeNodeTwistyProps> = (props) => {
  const { twisty, colors, theme } = props;

  if (twisty === undefined) {
    return null;
  }

  const styles = {
    base: css({
      width: SIZE.TWISTY_WIDTH,
      height: SIZE.LABEL,
      Flex: 'center-center',
      transform: `rotate(${twisty === 'OPEN' ? 90 : 0}deg)`,
      transition: `transform 0.2s`,
    }),
  };

  const color = colors.twisty || colors.chevron || theme.chevronColor;
  const elIcon = twisty !== null && <Icons.PlayArrow size={SIZE.TWISTY_ICON} color={color} />;
  const handlers = mouseHandlers('NODE', () => props.node, props.onMouse);

  return (
    <div {...styles.base} {...handlers}>
      {elIcon}
    </div>
  );
};
