import { t } from './common';
import { Compiler } from './compiler';
import { ConfigBuilder } from './config';

export const Webpack: t.Webpack = {
  config: ConfigBuilder,
  dev: Compiler.dev,
  watch: Compiler.watch,
  bundle: Compiler.bundle,
  upload: Compiler.upload,
};
