import '../d.global';

/**
 * Params passed to compiled code.
 * These are various flags used to setup different test scenarios.
 */
export type SampleNodeIn = {
  id?: string | number;
  throwError?: string;
  value?: any;
  repeatDone?: number;
  delay?: number;
  contentType?: string;
  contentTypeDef?: string;
};

export type SampleNodeOut = {
  echo?: any;
  process: Record<string, any>;
};
