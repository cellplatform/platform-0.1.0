import { NodeGlobalEnv } from '@platform/cell.types/lib/types.Runtime';

declare global {
  const env: NodeGlobalEnv;
}

/**
 * Params passed to compiled code.
 * These are various flags used to setup different test scenarios.
 */
export type EntryParams = {
  throwError?: string;
  value?: any;
  repeatDone?: number;
  delay?: number;
};

export type Result = {
  echo?: any;
  process: Record<string, any>;
};
