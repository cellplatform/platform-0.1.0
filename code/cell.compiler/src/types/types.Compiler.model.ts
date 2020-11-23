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
  dir?: string;
  static?: CompilerModelStatic | CompilerModelStatic[];
  lint?: boolean;
  entry?: Record<string, string>;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | t.WebpackShared>;
  env?: Record<string, t.Json>;

  /**
   * Files
   */
  redirects?: t.CompilerModelRedirectGrant[];

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
};

export type CompilerModelWebpack = {
  rules: t.WpRule[];
  plugins: t.WpPlugin[];
};

/**
 * Static Assets
 */
export type CompilerModelStatic = { dir?: string }; // Static assets.

/**
 * File redirection rules.
 */
export type CompilerModelRedirectAction = 'ALLOW' | 'DENY';
export type CompilerModelRedirectGrant = { action?: CompilerModelRedirectAction; grep?: string };

/**
 * HTML.
 */
export type CompilerModelHtml = {
  inject?: boolean;
  head?: JSX.Element;
  body?: JSX.Element;
};
