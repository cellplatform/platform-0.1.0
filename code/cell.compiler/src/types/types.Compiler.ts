import { t } from './common';

export type Compiler = {
  config: t.CompilerModelFactory['builder'];
  dev: t.CompilerRunDev;
  watch: t.CompilerRunWatch;
  bundle: t.CompilerRunBundle;
  upload: t.CompilerRunUpload;
  cell: t.CompilerCreateCell;
};

export type BeforeCompile = (e: BeforeCompileArgs) => void;
export type BeforeCompileModify<T> = (data: T) => void;
export type BeforeCompileArgs = {
  model: t.CompilerModel;
  modifyModel(handler: BeforeCompileModify<t.CompilerModel>): void;
  modifyWebpack(handler: BeforeCompileModify<t.WpConfig>): void;
  toObject<T>(draft?: any): T | undefined;
};
