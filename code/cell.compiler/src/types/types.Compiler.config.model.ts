import { t } from './common';

/**
 * Data model.
 */
export type CompilerModel = t.BuilderModel<t.CompilerWebpackModel>;

export type CompilerWebpackModel = {
  name: string;
  title?: string;
  mode: t.WpMode;
  url?: string;
  target?: t.WpTarget;
  dir?: string;
  lint?: boolean;
  entry?: Record<string, string>;
  rules?: t.WpConfigRule[];
  exposes?: Record<string, string>;
  remotes?: Record<string, string>;
  shared?: Record<string, string | t.WebpackShared>;
};
