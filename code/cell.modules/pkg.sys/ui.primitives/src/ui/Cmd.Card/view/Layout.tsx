import React from 'react';
import { CmdBar, Color, COLORS, css, CssValue, DEFAULT, t } from '../common';

/**
 * Types
 */
export type CmdCardLayoutProps = {
  instance: t.CmdCardInstance;
  body?: JSX.Element;
  tray?: JSX.Element;
  commandbar?: t.CmdCardCommandBar;
  borderRadius?: number | string;
  minimized?: boolean;
  style?: CssValue;
};

/**
 * Component
 */
export const CmdCardLayout: React.FC<CmdCardLayoutProps> = (props) => {
  const { FOOTER } = DEFAULT;
  const { instance, borderRadius, minimized = false, commandbar } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      overflow: 'hidden',
      borderRadius,
      height: minimized ? FOOTER.HEIGHT : undefined,
    }),
    body: css({
      Absolute: [0, 0, FOOTER.HEIGHT, 0],
      display: minimized ? 'none' : 'flex',
      backgroundColor: Color.format(1),
    }),
    footer: css({
      Absolute: [null, 0, 0, 0],
      height: FOOTER.HEIGHT,
      backgroundColor: COLORS.DARK,
      boxSizing: 'border-box',
      PaddingY: 2,
      Flex: 'x-stretch-stretch',
    }),
  };

  const elBody = <div {...styles.body}>{props.body}</div>;

  const elFooter = (
    <div {...styles.footer}>
      <CmdBar
        instance={instance}
        text={commandbar?.text}
        textbox={commandbar?.textbox}
        tray={props.tray}
        style={{ flex: 1 }}
      />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elFooter}
    </div>
  );
};
