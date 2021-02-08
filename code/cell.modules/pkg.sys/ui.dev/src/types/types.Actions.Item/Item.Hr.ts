import { t } from '../common';

type O = Record<string, unknown>;

/**
 * Hr (Horizontal Rule)
 */
export type DevActionHrConfig<Ctx extends O> = (args: DevActionHrConfigArgs<Ctx>) => void;
export type DevActionHrConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  height(value: number): DevActionHrConfigArgs<Ctx>;
  opacity(value: number): DevActionHrConfigArgs<Ctx>;
  margin(value: t.DevEdgeSpacing): DevActionHrConfigArgs<Ctx>;
};
