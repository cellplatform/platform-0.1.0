import React from 'react';

export { React };
export * from '../common';
import { t, rx } from '../common';

export const CommonEntry = {
  /**
   * Common initialization from an incoming "entry" call.
   */
  async init(pump: t.EventPump, ctx: t.ModuleDefaultEntryContext) {
    const bus = rx.bus();
    rx.pump.connect(pump).to(bus);
    return { pump, ctx, bus };
  },
};
