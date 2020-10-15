import { t } from './common';

export type Compiler = {
  config: t.CompilerConfigFactory;
  dev: t.CompilerRunDev;
  watch: t.CompilerRunWatch;
  bundle: t.CompilerRunBundle;
  upload: t.CompilerRunUpload;
  cell: t.CompilerCreateCell;
};

export type BeforeCompile = (e: BeforeCompileArgs) => void;
export type BeforeCompileModify = (draft: t.WpConfig) => void;
export type BeforeCompileArgs = {
  model: t.CompilerWebpackModel;
  modify(handler: BeforeCompileModify): void;
};
