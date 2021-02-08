type O = Record<string, unknown>;

/**
 * Title
 */
export type DevActionTitleConfig<Ctx extends O> = (args: DevActionTitleConfigArgs<Ctx>) => void;
export type DevActionTitleConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  text(value: string): DevActionTitleConfigArgs<Ctx>;
};
