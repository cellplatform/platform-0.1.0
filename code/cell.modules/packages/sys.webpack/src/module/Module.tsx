import { Module, t, id, constants } from '../common';
import { ConfigBuilder } from '../config';
import { Compiler } from '../compiler';

type P = t.WebpackProps;

export const Webpack: t.Webpack = {
  config: ConfigBuilder,
  dev: Compiler.dev,
  watch: Compiler.watch,
  bundle: Compiler.bundle,
  upload: Compiler.upload,

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
