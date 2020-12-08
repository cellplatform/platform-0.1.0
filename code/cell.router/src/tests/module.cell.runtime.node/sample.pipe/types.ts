import '../d.global';
import { RuntimeIn } from '@platform/cell.types/lib/types.Runtime';

/**
 * Params passed to compiled code.
 * These are various flags used to setup different test scenarios.
 */
export type ISamplePipeValue = {
  count: number;
  msg?: string;
};
