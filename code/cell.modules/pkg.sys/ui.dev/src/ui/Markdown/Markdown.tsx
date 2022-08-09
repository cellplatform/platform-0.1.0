import './css.global';
import React, { useMemo } from 'react';
import { constants, css, CssValue, Markdown as MD } from '../../common';

export type MarkdownProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const Markdown: React.FC<MarkdownProps> = (props) => {
  const { style } = props;

  const children = useMemo(() => {
    const content = props.children;
    if (typeof content !== 'string') return content;
    return MD.toHtmlSync(escapeBraces(content));
  }, [props.children]);

  if (typeof children !== 'string') {
    return <div {...css(props.style)}>{children}</div>;
  }

  const className = constants.CSS.MARKDOWN;
  return MD.UI.toElement(children, { style, className });
};

/**
 * [Helpers]
 */

function escapeBraces(text: string) {
  // NB: Escape opening to a <HTML> element so the markdown parser
  //     treats it as a character, not as HTML to be ignored.
  return text.replace(/</g, '\\<');
}
