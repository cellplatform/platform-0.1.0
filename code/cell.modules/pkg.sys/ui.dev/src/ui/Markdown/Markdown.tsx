import './css.global';
import React, { useMemo } from 'react';
import { constants, css, CssValue, Markdown as M } from '../../common';

export type MarkdownProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const children = useMemo(() => {
    const content = props.children;
    if (typeof content !== 'string') return content;
    return M.toHtmlSync(escapeBraces(content));
  }, [props.children]);

  if (typeof children !== 'string') {
    return <div {...css(props.style)}>{children}</div>;
  }

  return (
    <div
      {...props.style}
      dangerouslySetInnerHTML={{ __html: children }}
      className={constants.CSS.MARKDOWN}
    />
  );
};

/**
 * [Helpers]
 */

function escapeBraces(text: string) {
  // NB: Escape opening to a <HTML> element so the markdown parser
  //     treats it as a character, not as HTML to be ignored.
  return text.replace(/\</g, '\\<');
}
