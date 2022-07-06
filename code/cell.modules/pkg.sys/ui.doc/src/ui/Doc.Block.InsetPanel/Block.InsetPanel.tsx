import React, { useState } from 'react';
import { Color, COLORS, css, CssValue, DocMarkdownBlock, Icons, t } from './common';

export type DocInsetPanelBlockProps = {
  markdown?: string;
  margin?: t.DocBlockMargin;
  style?: CssValue;
};

export const DocInsetPanelBlock: React.FC<DocInsetPanelBlockProps> = (props) => {
  const { margin = {} } = props;
  const border = `solid 1px ${Color.alpha(COLORS.DARK, 0.08)}`;
  const transition = 'opacity 200ms';

  const [isOver, setOver] = useState(false);
  const over = (isOver: boolean) => () => setOver(isOver);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      cursor: 'default',
      backgroundColor: Color.alpha(COLORS.DARK, 0.03),
      border,
      borderRadius: 4,
      marginTop: margin.top,
      marginBottom: margin.bottom,
      Flex: 'x-stretch-stretch',
    }),
    left: css({
      borderRight: border,
      Padding: [12, 20, null, 20],
    }),
    right: css({
      flex: 1,
      Padding: [12, 20, 10, 20],
    }),
    icon: css({
      opacity: isOver ? 0.8 : 0.4,
      transition,
    }),
    markdown: css({
      opacity: isOver ? 1 : 0.6,
      transition,
    }),
  };
  return (
    <div {...css(styles.base, props.style)} onMouseEnter={over(true)} onMouseLeave={over(false)}>
      <div {...styles.left}>
        <Icons.Book color={COLORS.DARK} style={styles.icon} />
      </div>
      <div {...styles.right}>
        <DocMarkdownBlock markdown={props.markdown} style={styles.markdown} />
      </div>
    </div>
  );
};
