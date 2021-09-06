import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type SlugEditorProps = { style?: CssValue };

export const SlugEditor: React.FC<SlugEditorProps> = (props) => {
  const styles = {
    base: css({
      flex: 1,
      Flex: 'center-center',
    }),
  };
  return <div {...css(styles.base, props.style)}>SlugEditor</div>;
};
