import { t } from './common';
import { Tasks } from '../Compiler.tasks';
import { ConfigBuilder } from '../config';

export const Compiler: t.Compiler = {
  config: ConfigBuilder,
  dev: Tasks.dev,
  watch: Tasks.watch,
  bundle: Tasks.bundle,
  upload: Tasks.upload,
  cell: Tasks.cell,
};
