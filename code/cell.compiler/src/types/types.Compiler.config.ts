import { t } from './common';

type B = t.BuilderChain<CompilerConfigMethods>;

export type CompilerConfigFactory = {
  model(name: string): t.CompilerModel;
  create(input: string | t.CompilerModel | t.CompilerWebpackModel): CompilerConfig;
};

export type CompilerConfig = t.BuilderChain<CompilerConfigMethods>;

/**
 * Builder API
 */
export type CompilerConfigMethods = {
  toObject(): t.CompilerWebpackModel;
  toWebpack(): t.WpConfig;
  clone(): B;

  name(value: string): B;
  title(value: string | undefined): B;
  mode(value: t.WpMode | 'prod' | 'dev'): B;
  url(value: string | number | undefined): B;
  target(value: t.WpTarget | undefined): B;
  dir(value: string | undefined): B;
  lint(value: boolean | undefined): B;
  entry(path: string): B; // Default key: 'main'
  entry(key: string, path?: string | null): B;
  entry(map: Record<string, string | null>): B;
  rule(value: t.WpConfigRule): B;
  expose(key: string, path: string | null): B;
  remote(key: string, path: string | null): B;
  shared(fn: CompilerConfigSharedFunc): B;
};

export type CompilerConfigSharedFunc = (fn: CompilerConfigShared) => any;
export type CompilerConfigShared = {
  cwd: string;
  dependencies: Record<string, string>;
  add(dependencies: Record<string, string>): CompilerConfigShared;
  add(name: string | string[]): CompilerConfigShared;
  singleton(name: string | string[]): CompilerConfigShared;
};
