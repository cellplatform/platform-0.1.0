import React from 'react';

import { CmdCard, CmdCardProps } from '..';
import { t } from '../common';
import { Util } from '../Util';
import { SampleRenderer } from './DEV.Renderers';

export type DevSampleProps = {
  props: CmdCardProps;
  isControllerEnabled?: boolean;
  onStateChange?: (e: t.CmdCardState) => void;
};

/**
 * UI (Component)
 */
export const DevSample: React.FC<DevSampleProps> = (args) => {
  const controller = CmdCard.useController({
    instance: args.props.instance,
    enabled: args.isControllerEnabled,
    onChange: args.onStateChange,
    controller: DevSampleController,
  });

  return <CmdCard {...args.props} state={controller.state} style={{ flex: 1 }} />;
};

/**
 * CONTROLLER (logic "wrapper")
 */
export function DevSampleController(args: t.CmdCardControllerArgs) {
  const initial = Util.defaultState({
    body: { render: SampleRenderer.body },
    backdrop: { render: SampleRenderer.backdrop },
  });

  const card = CmdCard.Controller({ ...args, initial });

  console.group('🌳 DevSampleController');
  console.log('card', card);
  console.log('card.state', card.state.current);
  console.log('initial', initial);
  console.groupEnd();

  // card.state$.subscribe((e) => {
  //   console.log('ff', e);
  // });

  return card;
}
