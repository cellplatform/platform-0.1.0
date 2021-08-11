import '../d.global';
export { EventBus } from '@platform/types/lib/types.event';

/**
 * Params passed to compiled code.
 * These are various flags used to setup different test scenarios.
 */
export type ISampleNodeInValue = {
  id?: string | number;
  throwError?: string;
  value?: any;
  repeatDone?: number;
  delay?: number;
  setContentType?: string;
  setContentDef?: string;
  count?: number;
};

export type ISampleNodeOutValue = {
  echo?: any;
  process: Record<string, any>;
};
