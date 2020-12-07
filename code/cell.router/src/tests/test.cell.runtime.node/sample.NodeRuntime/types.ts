import '../d.global';

/**
 * Params passed to compiled code.
 * These are various flags used to setup different test scenarios.
 */
export type EntryParams = {
  id?: string | number;
  throwError?: string;
  value?: any;
  repeatDone?: number;
  delay?: number;
};

export type Result = {
  echo?: any;
  process: Record<string, any>;
};
