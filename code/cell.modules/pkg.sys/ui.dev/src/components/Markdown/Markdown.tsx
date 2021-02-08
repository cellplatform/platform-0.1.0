import './css.global';
import React, { useMemo } from 'react';
import { constants, css, CssValue, Markdown as M } from '../../common';

export type MarkdownProps = { style?: CssValue };
export const Markdown: React.FC<MarkdownProps> = (props) => {
  const children = useMemo(
    () => (typeof props.children === 'string' ? M.toHtmlSync(props.children) : props.children),
    [props.children],
  );
  if (typeof children !== 'string') {
    return <div {...css(props.style)}>{children}</div>;
  } else {
    return (
      <div
        {...props.style}
        dangerouslySetInnerHTML={{ __html: children }}
        className={constants.CSS.MARKDOWN}
      />
    );
  }
};
