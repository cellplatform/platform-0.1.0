import { EventBus, t } from './common';

/**
 * Hook: Icon Controller
 */
export type UseVimeoIconController = (args: UseVimeoIconControllerArgs) => VimeoIconController;

export type UseVimeoIconControllerArgs = {
  bus: EventBus<any>;
  id: t.VimeoInstance;
  isEnabled?: boolean;
};

export type VimeoIconController = {
  isEnabled: boolean;
  current?: t.VimeoIconFlag;
};
