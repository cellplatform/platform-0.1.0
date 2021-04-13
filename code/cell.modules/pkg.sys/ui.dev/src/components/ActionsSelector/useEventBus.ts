import { t } from '../../common';
import { ActionsSelectOnChangeEventHandler } from './types';

/**
 * Fires appropriate events into the bus for an <ActionsSelect.
 */
export function useEventBus(args: {
  bus?: t.EventBus;
  onChange?: ActionsSelectOnChangeEventHandler;
}) {
  const bus = args.bus?.type<t.DevEvent>();
  const active = Boolean(bus);

  const onChange: ActionsSelectOnChangeEventHandler = (e) => {
    if (bus) {
      const { selected } = e;
      const model = selected.toObject();
      const { namespace } = model;
      bus.fire({ type: 'sys.ui.dev/actions/select/changed', payload: { namespace } });
    }
    if (args.onChange) args.onChange(e);
  };

  return { active, bus, onChange };
}
