import { t } from '../common';
import { addModuleStrategy } from './strategy.add';
import { renderStrategy } from './strategy.render';
import { selectionStrategy } from './strategy.selection';

type E = t.HarnessEvent;

/**
 * Behavior logic for a UIHarness.
 */
export function strategy(args: { harness: t.HarnessModule; bus: t.EventBus }) {
  const { harness } = args;
  const bus = args.bus.type<E>();

  addModuleStrategy({ harness, bus });
  renderStrategy({ harness, bus });
  selectionStrategy({ harness, bus });
}
