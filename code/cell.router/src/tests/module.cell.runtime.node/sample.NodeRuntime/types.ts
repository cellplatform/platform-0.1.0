import '../d.global';

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
};

export type ISampleNodeOutValue = {
  echo?: any;
  process: Record<string, any>;
};
