import React from 'react';

import { CmdCard, CmdCardProps } from '..';
import { t } from '../common';

export type DevSampleProps = {
  props: CmdCardProps;
  isControllerEnabled?: boolean;
  onStateChange?: (e: t.CmdCardState) => void;
};

/**
 * VIEW/UI (Component)
 */
export const DevSample: React.FC<DevSampleProps> = (args) => {
  const controller = CmdCard.useController({
    instance: args.props.instance,
    enabled: args.isControllerEnabled,
    onChange: args.onStateChange,
    onExecuteCommand(e) {
      console.log('⚡️ onExecuteCommand:', e);
    },
  });

  const props = { ...args.props, ...controller.props };
  return <CmdCard {...props} style={{ flex: 1 }} />;
};
