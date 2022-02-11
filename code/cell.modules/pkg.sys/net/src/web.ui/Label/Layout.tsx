import React from 'react';

import { COLORS, css, CssValue, Text } from '../../common';
import { Icons } from '../Icons';

export type RenderLabelIconEvent = { text: string };
export type RenderLabelIconEventHandler = (e: RenderLabelIconEvent) => void;

export type LabelLayoutProps = {
  text: string;
  isCopyable?: boolean;
  renderIcon?: RenderLabelIconEventHandler;
  labelOffset?: [number, number]; // [x,y]
  style?: CssValue;
};

export const LabelLayout: React.FC<LabelLayoutProps> = (props) => {
  const { text, isCopyable = true, labelOffset = [0, 0] } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'x-center-start', color: COLORS.DARK }),
    icon: css({ marginRight: 6, Size: 22 }),
    label: css({
      left: labelOffset[0],
      top: labelOffset[1],
      position: 'relative',
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: 600,
    }),
    copied: css({ fontFamily: 'sans-serif', fontWeight: 400 }),
  };

  const elIcon = (
    <div {...styles.icon}>{props.renderIcon?.({ text }) ?? <Icons.Unknown size={22} />}</div>
  );

  const elCopied = <div {...styles.copied}>copied</div>;

  const elLabel = (
    <div {...styles.label}>
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
      >
        <Text.Syntax text={text} />
      </Text.Copy>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elIcon}
      {elLabel}
    </div>
  );
};
