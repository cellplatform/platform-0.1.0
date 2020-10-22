import { t } from './common';

/**
 * Data Model
 */
export type CompilerModelState = t.BuilderModel<t.CompilerModel>;
export type CompilerModel = {
  /**
   * Values
   */
  name: string; // Configuration name (eg: "base", "prod", "dev")
  scope?: string; // Module federation scope: https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
  title?: string;
  mode: t.WpMode;
  port?: number;
  target?: t.WpTarget;
  dir?: string;
  lint?: boolean;
  entry?: Record<string, string>;
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | t.WebpackShared>;

  /**
   * Hooks
   */
  beforeCompile?: t.BeforeCompile[];

  /**
   * Children
   */
  webpack?: t.CompilerModelWebpack;
  variants?: t.CompilerModelBuilder[];
};

export type CompilerModelWebpack = {
  rules: t.WpRule[];
  plugins: t.WpPlugin[];
};
