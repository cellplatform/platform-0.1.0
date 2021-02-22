import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { TextInput } from '../Primitives';

export type TextboxProps = {
  namespace: string;
  bus: t.EventBus<t.Event<any>>;
  item: t.ActionTextbox;
};

export const Textbox: React.FC<TextboxProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return <div {...styles.base}>Textbox</div>;
};
