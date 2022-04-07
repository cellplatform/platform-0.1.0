import React from 'react';

import { CmdCard, CmdCardProps } from '..';
import { useSampleState, UseSampleStateArgs } from './DEV.Sample.State';

export type DevSampleProps = {
  props: CmdCardProps;
  useSampleState: UseSampleStateArgs;
};

export const DevSample: React.FC<DevSampleProps> = (args) => {
  /**
   * State
   */
  const controller = useSampleState(args.props.instance, args.useSampleState);

  /**
   * Component.
   */
  return <CmdCard {...args.props} state={controller.state} style={{ flex: 1 }} />;
};
