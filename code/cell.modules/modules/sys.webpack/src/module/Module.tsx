import { Module, t, id, constants } from '../common';
import { WebpackBuilders } from '../language';

type P = t.WebpackProps;

export const Webpack: t.Webpack = {
  /**
   * API builders (DSL).
   */
  builder: WebpackBuilders,

  /**
   * Module initialization.
   */
  module(bus) {
    const webpack = Module.create<P>({
      bus,
      kind: constants.KIND,
      root: {
        id: `${id.shortid()}.webpack`,
        props: { data: constants.DEFAULT.DATA },
      },
    });
    return webpack;
  },
};
