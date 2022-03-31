import React from 'react';

import { CmdCard, CmdCardProps } from '..';
import { t } from '../common';

export type DevSampleProps = {
  bus: t.EventBus<any>;
  props: CmdCardProps;
  state: {
    initial: t.CmdCardState;
    isControllerEnabled?: boolean;
    onChange?: (e: t.CmdCardState) => void;
  };
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  const { props, bus } = args;
  const { instance } = props;

  /**
   * [State]
   */
  const { state } = CmdCard.State.useController({
    instance,
    bus,
    initial: args.state.initial,
    enabled: args.state.isControllerEnabled,
    onChange: args.state.onChange,
  });

  /**
   * [Render]
   */
  return <CmdCard {...props} state={state} style={{ flex: 1 }} />;
};
