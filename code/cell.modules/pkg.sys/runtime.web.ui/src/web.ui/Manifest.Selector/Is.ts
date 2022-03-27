import { t } from '../common';

type InstanceId = string;

export const Is = {
  manifestSelectorEvent(e: t.Event, component: InstanceId) {
    if (!e.type.startsWith('sys.runtime.web/ManifestSelector/')) return false;
    return (e as t.ManifestSelectorEvent).payload.component === component;
  },
};
