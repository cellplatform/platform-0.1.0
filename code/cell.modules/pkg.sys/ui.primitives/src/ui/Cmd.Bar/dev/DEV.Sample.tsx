import React from 'react';

import { CmdBar, CmdBarProps } from '..';
import { t } from '../common';

export type DevSampleProps = {
  props: CmdBarProps;
  onStateChange?: t.CmdBarStateChangeHandler;
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  const { props, onStateChange } = args;
  const { instance } = props;

  const controller = CmdBar.useController({ instance, onStateChange });
  const state = controller.state;

  return <CmdBar {...props} text={state.text} hint={state.hint} style={{ flex: 1 }} />;
};
