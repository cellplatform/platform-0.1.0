import { t, constants } from './common';
import { Tasks } from '../Compiler.tasks';
import { ConfigBuilder } from '../config';

export const Compiler: t.Compiler = {
  config: ConfigBuilder.builder,
  devserver: Tasks.devserver,
  watch: Tasks.watch,
  bundle: Tasks.bundle,
  cell: Tasks.cell,
};
