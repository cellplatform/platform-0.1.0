import { t } from './common';

export type Compiler = {
  config: t.CompilerConfigFactory;
  dev: t.CompilerRunDev;
  watch: t.CompilerRunWatch;
  bundle: t.CompilerRunBundle;
  upload: t.CompilerRunUpload;
  cell: t.CompilerCreateCell;
};
