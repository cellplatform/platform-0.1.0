import { rx, slug, t } from './common';

export const Util = {
  dummyInstance(): t.EventListInstance {
    return {
      bus: rx.bus(),
      id: `EventList.${slug()}:internal`,
    };
  },
};
