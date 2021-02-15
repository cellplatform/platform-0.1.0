import { t } from '../../common';

type O = Record<string, unknown>;

export * from './Display.Hr';
export * from './Display.Title';

/**
 * Methods for basic display markup such as titles.
 */
export type DisplayMethods<Ctx extends O> = {
  hr(height?: number, opacity?: number, margin?: t.EdgeSpacing): DisplayMethods<Ctx>;
  hr(config?: t.ActionHrConfig<Ctx>): DisplayMethods<Ctx>;
  title(text: string, config?: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
  title(config: t.ActionTitleConfig<Ctx>): t.Actions<Ctx>;
};
