import React from 'react';

import { CmdCard, CmdCardProps } from '..';
import { t } from '../common';
import { DevSampleController } from './DEV.Sample.controller';

export type DevSampleProps = {
  props: CmdCardProps;
  isControllerEnabled?: boolean;
  onStateChange?: (e: t.CmdCardState) => void;
};

/**
 * Sample View
 */
export const DevSample: React.FC<DevSampleProps> = (args) => {
  /**
   * State
   */
  const controller = CmdCard.State.useController({
    instance: args.props.instance,
    enabled: args.isControllerEnabled,
    onChange: args.onStateChange,
    controller: DevSampleController,
  });

  /**
   * Component.
   */
  return <CmdCard {...args.props} state={controller.state} style={{ flex: 1 }} />;
};
