import React, { useMemo } from 'react';

import { css, CssValue, DEFAULT, Markdown, t } from '../common';
import { className } from '../styles';

export type ImageCreditProps = {
  markdown?: string;
  align?: t.DocImageCreditAlign;
  style?: CssValue;
};

export const ImageCredit: React.FC<ImageCreditProps> = (props) => {
  const { markdown } = props;
  const textAlign = (props.align ?? DEFAULT.credit.align).toLowerCase();

  /**
   * [Render]
   */
  const styles = {
    base: css({ textAlign }),
  };

  const html = useMemo(() => {
    const style = css({});
    return Markdown.UI.toElement(markdown, { style, className });
  }, [markdown]); // eslint-disable-line

  return <div {...css(styles.base, props.style)}>{html}</div>;
};
