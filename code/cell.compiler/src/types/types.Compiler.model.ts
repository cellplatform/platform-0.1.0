import { t } from './common';

/**
 * Data Model
 */
export type CompilerModelState = t.BuilderModel<t.CompilerModel>;
export type CompilerModel = {
  parent(): CompilerModel | undefined;

  /**
   * Values
   */
  name: string; // Configuration name (eg: "base", "prod", "dev")
  namespace?: string; // Module federation "scope": https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
  title?: string;
  mode: t.WpMode;
  port?: number;
  target?: string;
  outdir?: string;
  static?: CompilerModelStatic | CompilerModelStatic[];
  declarations?: CompilerModelDeclarations[];
  lint?: boolean;
  entry?: Record<string, string>;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | t.WebpackShared>;
  env?: Record<string, t.Json>;

  /**
   * Hooks
   */
  beforeCompile?: t.BeforeCompile[];
  afterCompile?: t.AfterCompile[];

  /**
   * Children
   */
  webpack?: t.CompilerModelWebpack;
  variants?: t.CompilerModelBuilder[];
  html?: t.CompilerModelHtml;
  files?: t.CompilerModelFiles;
};

/**
 * Underlying Webpack Modifications.
 */
export type CompilerModelWebpack = {
  rules: t.WpRule[];
  plugins: t.WpPlugin[];
};

/**
 * Output File.
 */
export type CompilerModelFiles = {
  redirects?: t.CompilerModelRedirect[];
  access?: t.CompilerModelFileAccess[];
};

export type CompilerModelFileAccessPermission = 'private' | 'public';
export type CompilerModelFileAccess = {
  permission: CompilerModelFileAccessPermission;
  grep?: string;
};

/**
 * File Redirection Rules
 */
export type CompilerModelRedirectAction = 'ALLOW' | 'DENY';
export type CompilerModelRedirect = { action?: CompilerModelRedirectAction; grep?: string };

/**
 * HTML
 */
export type CompilerModelHtml = {
  inject?: boolean;
  head?: JSX.Element;
  body?: JSX.Element;
};

/**
 * Static Assets.
 */
export type CompilerModelStatic = { dir?: string }; // Static assets.

/**
 * Type Declarations (typescript [.d.ts] files)
 */
export type CompilerModelDeclarations = {
  include: string | string[]; // TSConfig "include" path. File or grep pattern, eg: src/foo/**/*
  dir: string;
};
