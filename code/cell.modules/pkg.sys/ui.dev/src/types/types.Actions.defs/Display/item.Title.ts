type O = Record<string, unknown>;

/**
 *  Title text.
 */
export type ActionTitle = {
  id: string;
  kind: 'display/title';
  text: string;
  indent?: number;
};

/**
 * CONFIGURE Title.
 */
export type ActionTitleConfig<Ctx extends O> = (args: ActionTitleConfigArgs<Ctx>) => void;
export type ActionTitleConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  text(value: string): ActionTitleConfigArgs<Ctx>;
  indent(value: number): ActionTitleConfigArgs<Ctx>;
};
