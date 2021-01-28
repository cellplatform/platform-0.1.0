import React, { useEffect, useRef, useState } from 'react';

import { css, CssValue } from '../../common';
import { ObjectView } from '../../';

export type ComponentProps = {
  text?: string;
  data?: any;
  style?: CssValue;
};

export const Component: React.FC<ComponentProps> = (props) => {
  const styles = {
    base: css({ padding: 20 }),
    text: css({ marginBottom: 10 }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.text}>{props.text}</div>
      <ObjectView name={'subject'} data={props.data} />
    </div>
  );
};
