type O = Record<string, unknown>;

/**
 *  Title text.
 */
export type ActionTitle = {
  id: string;
  kind: 'title';
  text: string;
};

/**
 * CONFIGURE Title,
 */
export type ActionTitleConfig<Ctx extends O> = (args: ActionTitleConfigArgs<Ctx>) => void;
export type ActionTitleConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  text(value: string): ActionTitleConfigArgs<Ctx>;
};
