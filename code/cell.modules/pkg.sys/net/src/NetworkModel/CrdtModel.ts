import { t } from './common';

type O = Record<string, unknown>;

/**
 * An editable CRDT model.
 */
export function CrdtModel<T extends O>(args: { bus: t.EventBus<any> }) {
  return {};
}
