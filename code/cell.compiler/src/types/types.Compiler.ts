import { t } from './common';
import { Compilation } from 'webpack';

export type Compiler = {
  config: t.CompilerModelFactory['builder'];
  devserver: t.CompilerRunDevserver;
  watch: t.CompilerRunWatch;
  bundle: t.CompilerRunBundle;
  bundleDeclarations: t.CompilerRunBundleDeclarations;
};

export type CompilerPackageJson = t.NpmPackageJson & { compiler: { port: number } };

export type BeforeCompile = (e: BeforeCompileArgs) => void;
export type BeforeCompileModify<T> = (data: T) => void;
export type BeforeCompileArgs = {
  name: string;
  model: t.CompilerModel;
  modifyModel(handler: BeforeCompileModify<t.CompilerModel>): void;
  modifyWebpack(handler: BeforeCompileModify<t.WpConfig>): void;
  toObject<T>(draft?: any): T | undefined;
};

export type AfterCompile = (e: AfterCompileArgs) => void;
export type AfterCompileArgs = {
  name: string;
  model: t.CompilerModel;
  webpack: t.WpConfig;
  compilation: Compilation;
  dir: string;
};
