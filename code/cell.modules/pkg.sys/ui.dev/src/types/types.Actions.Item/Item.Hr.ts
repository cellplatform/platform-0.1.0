import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Horizontal rule (divider).
 */
export type ActionHr = {
  id: string;
  kind: 'hr';
  height: number;
  opacity: number;
  margin: t.EdgeSpacing;
};

/**
 * CONFIGURE Horizontal Rule
 */
export type ActionHrConfig<Ctx extends O> = (args: ActionHrConfigArgs<Ctx>) => void;
export type ActionHrConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  height(value: number): ActionHrConfigArgs<Ctx>;
  opacity(value: number): ActionHrConfigArgs<Ctx>;
  margin(value: t.EdgeSpacing): ActionHrConfigArgs<Ctx>;
};
