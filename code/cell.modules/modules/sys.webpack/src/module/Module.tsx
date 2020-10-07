import { Module, t, id, constants } from '../common';
import { WebpackBuilders } from '../language';
import { DEFAULT } from '../language/wp.ConfigBuilder/DEFAULT'; // TEMP 🐷

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
        props: { data: DEFAULT.DATA },
      },
    });
    return webpack;
  },
};
