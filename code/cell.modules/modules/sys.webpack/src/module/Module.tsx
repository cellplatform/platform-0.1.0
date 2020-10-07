import { Module, t, id, constants } from '../common';
import { ConfigBuilder } from '../language';
import { Compiler } from '../compiler';

type P = t.WebpackProps;

export const Webpack: t.Webpack = {
  config: ConfigBuilder,
  bundle: Compiler.bundle,
  watch: Compiler.watch,
  dev: Compiler.dev,

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
