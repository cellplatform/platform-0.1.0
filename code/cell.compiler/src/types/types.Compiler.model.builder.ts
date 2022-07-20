import { t } from './common';

type B = CompilerModelBuilder;
type ConfigName = string;

export type CompilerModelFactory = {
  model(name: ConfigName): t.CompilerModelState;
  builder(input?: ConfigName | t.CompilerModelState | t.CompilerModel): t.CompilerModelBuilder;
};

/**
 * Model Builder API
 */
export type CompilerModelBuilder = t.BuilderChain<CompilerModelMethods>;

export type CompilerModelMethods = {
  name(): string;
  toObject(): t.CompilerModel;
  toWebpack(): t.WpConfig;
  toPaths(): t.CompilerModelPaths;

  clone(initial?: Partial<t.CompilerModel>): B;
  find(name: string): B | null;

  variant(name: string, configure: (config: B) => void): B;
  webpack(handler: (config: CompilerModelMethodsWebpack) => void): B;
  html(handler: (config: t.CompilerModelMethodsHtml) => void): B;
  files(handler: (config: t.CompilerModelMethodsFiles) => void): B;

  beforeCompile(handler: t.BeforeCompile): B;
  afterCompile(handler: t.AfterCompile): B;

  title(value: string | null): B;
  namespace(value: string): B;
  version(value?: string): B;
  mode(value: t.WpMode | 'prod' | 'dev'): B;
  port(value: number | null): B;
  target(value: string | null): B;
  outdir(value: string | null): B;
  static(value: string | null): B;
  declarations(clear: null): B;
  declarations(include: string, dir?: string): B;
  lint(value: boolean | null): B;
  entry(path: string): B; // Default key: 'main'
  entry(key: string, path?: string | null): B;
  entry(map: Record<string, string | null>): B;
  expose(key: string, path: string | null): B;
  remote(key: string, path: string | null): B;
  shared(fn: CompilerConfigSharedFunc): B;
  env(value: Record<string, t.Json> | null): B;
};

export type CompilerModelMethodsWebpack = {
  rule(value: t.WpRule): CompilerModelMethodsWebpack;
  plugin(value: t.WpPlugin): CompilerModelMethodsWebpack;
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

type H = CompilerModelMethodsHtml;
export type CompilerModelMethodsHtml = {
  inject(value: boolean | undefined): H;
  head(el: JSX.Element | undefined): H;
  body(el: JSX.Element | undefined): H;
};

type F = CompilerModelMethodsFiles;
export type CompilerModelMethodsFiles = {
  access(permission: t.CompilerModelFileAccessPermission, grep: string): F;
};
