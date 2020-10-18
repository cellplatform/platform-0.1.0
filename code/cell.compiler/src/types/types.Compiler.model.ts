import { t } from './common';

/**
 * Data Model
 */
export type CompilerModelState = t.BuilderModel<t.CompilerModel>;
export type CompilerModel = {
  /**
   * Values
   */
  name: string;
  title?: string;
  mode: t.WpMode;
  url?: string;
  target?: t.WpTarget;
  dir?: string;
  lint?: boolean;
  entry?: Record<string, string>;
  rules?: t.WpRule[]; // TEMP 🐷
  plugins?: t.WpPlugin[]; // TEMP 🐷
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
  webpack?: {
    rules: t.WpRule[];
    plugins: t.WpPlugin[];
  };
};
