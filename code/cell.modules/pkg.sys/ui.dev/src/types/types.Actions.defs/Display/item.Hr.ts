import { t } from '../../common';

type O = Record<string, unknown>;
export type ActionHrBorderStyle = 'solid' | 'dashed';

/**
 * Horizontal rule (divider).
 */
export type ActionHr = {
  id: string;
  kind: 'display/hr';
  height: number;
  opacity: number;
  margin: t.CssEdgesInput;
  borderStyle: ActionHrBorderStyle;
};

/**
 * CONFIGURE Horizontal Rule.
 */
export type ActionHrConfig<Ctx extends O> = (args: ActionHrConfigArgs<Ctx>) => void;
export type ActionHrConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  height(value: number): ActionHrConfigArgs<Ctx>;
  opacity(value: number): ActionHrConfigArgs<Ctx>;
  margin(value: t.CssEdgesInput): ActionHrConfigArgs<Ctx>;
  borderStyle(value: ActionHrBorderStyle): ActionHrConfigArgs<Ctx>;
};
