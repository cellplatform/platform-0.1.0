import { t } from './common';

type B = t.BuilderChain<CompilerModelMethods>;
type W = t.BuilderChain<CompilerModelWebpackMethods>;

export type CompilerModelFactory = {
  model(name: string): t.CompilerModelState;
  builder(input?: string | t.CompilerModelState | t.CompilerModel): t.CompilerModelBuilder;
};

/**
 * Model Builder API
 */
export type CompilerModelBuilder = t.BuilderChain<CompilerModelMethods>;

export type CompilerModelMethods = {
  webpack: CompilerModelWebpackMethods;

  name(): string;
  toObject(): t.CompilerModel;
  toWebpack(): t.WpConfig;

  clone(initial?: Partial<t.CompilerModel>): B;
  variant(name: string, configure: (config: B) => void): B;
  find(name: string): B | null;

  beforeCompile(handler: t.BeforeCompile): B;
  afterCompile(handler: t.AfterCompile): B;

  title(value: string | undefined): B;
  namespace(value: string): B;
  mode(value: t.WpMode | 'prod' | 'dev'): B;
  port(value: number | undefined): B;
  target(value: t.WpTarget | undefined): B;
  dir(value: string | undefined): B;
  static(value: string | string[] | null): B;
  lint(value: boolean | undefined): B;
  entry(path: string): B; // Default key: 'main'
  entry(key: string, path?: string | null): B;
  entry(map: Record<string, string | null>): B;
  expose(key: string, path: string | null): B;
  remote(key: string, path: string | null): B;
  shared(fn: CompilerConfigSharedFunc): B;
};

export type CompilerModelWebpackMethods = {
  parent(): B;
  rule(value: t.WpRule): W;
  plugin(value: t.WpPlugin): W;
};

export type CompilerConfigSharedFunc = (fn: CompilerConfigShared) => any;
export type CompilerConfigShared = {
  cwd: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  add(dependencies: Record<string, string>): CompilerConfigShared;
  add(name: string | string[]): CompilerConfigShared;
  singleton(name: string | string[]): CompilerConfigShared;
  version(name: string): string;
};
