import React from 'react';
import { distinctUntilChanged, map } from 'rxjs/operators';

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
 * VIEW/UI (Component)
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
  const initial = Util.state.default({
    body: { render: SampleRenderer.body },
    backdrop: { render: SampleRenderer.backdrop },
  });

  const card = CmdCard.Controller({ ...args, initial });
  const { dispose$ } = card;
  const patch = card.state.patch;

  const text$ = card.state.$.pipe(
    map((e) => e.value.commandbar.text ?? ''),
    distinctUntilChanged((prev, next) => prev === next),
  );

  /**
   * TODO 🐷
   * - complete this state change logic.
   * - move to proper place within "real" controllers.
   * - show example of doing something "useful" within this sample "wrapper" controller
   */
  text$.subscribe(async (text) => {
    await patch((state) => {
      state.commandbar.textbox.pending = Boolean(text);
    });
  });

  // commandbar.
  card.commandbar.onExecuteCommand(async (e) => {
    //
    // console.log('DEV onExecuteCommand', e);
    await patch((state) => (state.commandbar.textbox.spinning = true));
  });

  return card;
}
