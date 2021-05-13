import React, { useEffect, useState } from 'react';

import { css, CssValue } from './common';
import {
  RecordButtonDialogHandler,
  RecordButtonDialogHandlerArgs,
  RecordButtonState,
} from './types';

export type DialogProps = {
  isEnabled: boolean;
  state: RecordButtonState;
  borderRadius: number;
  style?: CssValue;
  onDialog?: RecordButtonDialogHandler;
};

export const Dialog: React.FC<DialogProps> = (props) => {
  const { state, borderRadius, onDialog } = props;
  const [elBody, setElBody] = useState<JSX.Element | undefined>();

  useEffect(() => {
    if (onDialog) {
      const args: RecordButtonDialogHandlerArgs = {
        element: (view) => {
          setElBody(() => view);
          return args;
        },
      };
      onDialog(args);
    }
  }, [state]); // eslint-disable-line

  if (state !== 'dialog') return null;

  const styles = {
    base: css({
      Absolute: 0,
      borderRadius,
      overflow: 'hidden',
      boxSizing: 'border-box',
      display: 'flex',
    }),
  };
  return <div {...css(styles.base, props.style)}>{elBody}</div>;
};
