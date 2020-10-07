import { Module, t, id, constants } from '../common';
import { Builders } from '../language';

type P = t.WebpackProps;

export const Webpack: t.Webpack = {
  /**
   * API builders (DSL).
   */
  builder: Builders,

  /**
   * Module initialization.
   */
  module(bus) {
    const webpack = Module.create<P>({
      bus,
      kind: constants.KIND,
      root: {
        id: `${id.shortid()}.webpack`,
        props: { data: {} },
      },
    });
    return webpack;
  },
};
