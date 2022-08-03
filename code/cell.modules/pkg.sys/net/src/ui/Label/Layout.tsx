import React from 'react';

import { COLORS, css, CssValue, Text, Button } from '../common';
import { Icons } from '../Icons';

type OpacityPercent = number;

export type RenderLayoutIconEvent = { text: string };
export type RenderLayoutIconEventHandler = (e: RenderLayoutIconEvent) => void;

export type LayoutTarget = 'Label' | 'Icon:Left' | 'Icon:Right';
export type LayoutClickEvent = { target: LayoutTarget };
export type LayoutClickEventHandler = (e: LayoutClickEvent) => void;

export type LayoutProps = {
  text: string;
  isCopyable?: boolean;
  renderIconLeft?: OpacityPercent | RenderLayoutIconEventHandler;
  renderIconRight?: boolean | OpacityPercent | RenderLayoutIconEventHandler;
  labelOffset?: [number, number]; // [x,y]
  style?: CssValue;
  onClick?: LayoutClickEventHandler;
  onCopyIcon?: (e: { isVisible: boolean; action: 'Mouse' }) => void;
};

export const Layout: React.FC<LayoutProps> = (props) => {
  const { text, isCopyable = true, labelOffset = [0, 0] } = props;

  const onClick = (target: LayoutClickEvent['target']) => props.onClick?.({ target });

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'x-center-start', color: COLORS.DARK }),
    label: css({
      left: labelOffset[0],
      top: labelOffset[1],
      position: 'relative',
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: 600,
    }),
    copied: css({
      fontFamily: 'sans-serif',
      fontWeight: 400,
    }),
    icon: {
      left: css({
        Size: 22,
        marginRight: 6,
        opacity: typeof props.renderIconLeft === 'number' ? props.renderIconRight : undefined,
      }),
      right: css({
        marginLeft: 6,
        opacity: typeof props.renderIconRight === 'number' ? props.renderIconRight : undefined,
      }),
      defaultLeft: css({}),
      defaultRight: css({ position: 'relative', top: 1 }),
    },
  };

  const elIconMore = <Icons.More size={14} />;

  const elDefaultLeft = <div {...styles.icon.defaultLeft}>{<Icons.Unknown size={22} />}</div>;

  const elDefaultRight = (
    <div {...styles.icon.defaultRight}>
      <Button>{elIconMore}</Button>
    </div>
  );

  const elIconLeft = (
    <div {...styles.icon.left} onClick={() => onClick('Icon:Left')}>
      <Button isEnabled={Boolean(props.onClick)} theme={{ disabledOpacity: 1 }}>
        <>
          {typeof props.renderIconLeft === 'function' && props.renderIconLeft?.({ text })}
          {!props.renderIconLeft && elDefaultLeft}
        </>
      </Button>
    </div>
  );

  const elIconRight = (
    <div {...styles.icon.right} onClick={() => onClick('Icon:Right')}>
      <>
        {props.renderIconRight === true && elDefaultRight}
        {typeof props.renderIconRight === 'number' && elDefaultRight}
        {typeof props.renderIconRight === 'function' && props.renderIconRight?.({ text })}
      </>
    </div>
  );

  const elCopied = <div {...styles.copied}>copied</div>;

  const elLabel = (
    <div {...styles.label} onClick={() => onClick('Label')}>
      <Text.Copy
        isCopyable={isCopyable}
        onCopy={(e) => {
          e.copy(text);
          e.message(elCopied, { opacity: 0.3, blur: 2, grayscale: 1 });
        }}
        icon={{
          element: <Text.Copy.Icon size={13} />,
          offset: 3,
          edge: 'E',
        }}
        onMouse={(e) => {
          if (isCopyable) {
            props.onCopyIcon?.({ isVisible: e.isOver, action: 'Mouse' });
          }
        }}
      >
        <Text.Syntax text={text} />
      </Text.Copy>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elIconLeft}
      {elLabel}
      {elIconRight}
    </div>
  );
};
