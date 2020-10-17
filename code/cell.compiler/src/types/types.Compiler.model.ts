import { t } from './common';

/**
 * Data model.
 */
export type CompilerModelState = t.BuilderModel<t.CompilerModel>;
export type CompilerModel = {
  name: string;
  title?: string;
  mode: t.WpMode;
  url?: string;
  target?: t.WpTarget;
  dir?: string;
  lint?: boolean;
  entry?: Record<string, string>;
  rules?: t.WpRule[];
  plugins?: t.WpPlugin[];
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | t.WebpackShared>;
  beforeCompile?: t.BeforeCompile[];
};
