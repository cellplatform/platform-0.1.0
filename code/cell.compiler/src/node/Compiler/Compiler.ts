import { t } from './common';
import { Tasks } from '../compiler.tasks';
import { ConfigBuilder } from '../config';

export const Compiler: t.Compiler = {
  config: ConfigBuilder.builder,
  devserver: Tasks.devserver,
  watch: Tasks.watch,
  bundle: Tasks.bundle,
  bundleDeclarations: Tasks.bundleDeclarations,
};
