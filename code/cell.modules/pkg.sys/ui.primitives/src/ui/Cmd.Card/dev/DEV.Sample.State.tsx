import { t } from '../common';
import { CmdCard } from '..';

export type UseSampleStateArgs = {
  initial: t.CmdCardState;
  bus?: t.EventBus<any>;
  isControllerEnabled?: boolean;
  onChange?: (e: t.CmdCardState) => void;
};

export function useSampleState(instance: t.CmdCardInstance, args: UseSampleStateArgs) {
  /**
   * Core State Controller
   */
  const controller = CmdCard.State.useController({
    instance,
    bus: args.bus,
    initial: args.initial,
    enabled: args.isControllerEnabled,
    onChange: args.onChange,
  });

  return controller;
}
