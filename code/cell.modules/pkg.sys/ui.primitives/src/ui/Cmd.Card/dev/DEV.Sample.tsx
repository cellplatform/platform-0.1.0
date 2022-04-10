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
 * Sample View
 */
export const DevSample: React.FC<DevSampleProps> = (args) => {
  const controller = CmdCard.State.useController({
    instance: args.props.instance,
    enabled: args.isControllerEnabled,
    onChange: args.onStateChange,
    controller: DevSampleController,
  });

  return <CmdCard {...args.props} state={controller.state} style={{ flex: 1 }} />;
};

/**
 * Sample Controller ("Wrapper")
 */
export function DevSampleController(args: t.CmdCardStateControllerArgs) {
  const initial = Util.defaultState({
    body: { render: SampleRenderer.body },
    backdrop: { render: SampleRenderer.backdrop },
  });

  const card = CmdCard.State.Controller({ ...args, initial });

  card.state$.subscribe((e) => {
    console.log('ff', e);
  });

  return card;
}
