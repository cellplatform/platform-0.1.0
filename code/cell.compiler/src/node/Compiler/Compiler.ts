import { t } from './common';
import { Tasks } from '../Compiler.tasks';
import { ConfigBuilder } from '../Config';

export const Compiler: t.Compiler = {
  config: ConfigBuilder.builder,
  devserver: Tasks.devserver,
  watch: Tasks.watch,
  bundle: Tasks.bundle,
  bundleDeclarations: Tasks.bundleDeclarations,
};
