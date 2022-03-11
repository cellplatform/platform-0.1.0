import { t, rx } from '../../common';
import { ActionsSelectOnChangeEventHandler } from './types';

/**
 * Fires appropriate events into the bus for an <ActionsSelect> component.
 */
export function useEventBus(args: {
  bus?: t.EventBus<any>;
  onChange?: ActionsSelectOnChangeEventHandler;
}) {
  const bus = rx.busAsType<t.DevEvent>(args.bus || rx.bus());
  const active = Boolean(bus);

  const onChange: ActionsSelectOnChangeEventHandler = (e) => {
    if (bus) {
      const { selected } = e;
      const model = selected.toObject();
      const { namespace } = model;
      bus.fire({
        type: 'sys.ui.dev/actions/select/changed',
        payload: { namespace },
      });
    }
    args.onChange?.(e);
  };

  return { active, bus, onChange };
}
