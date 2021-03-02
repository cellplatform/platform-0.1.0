type O = Record<string, unknown>;

/**
 *  Markdown display text.
 */
export type ActionMarkdown = {
  id: string;
  kind: 'display/markdown';
  markdown: string;
};

/**
 * CONFIGURE Markdown.
 */
export type ActionMarkdownConfig<Ctx extends O> = (args: ActionMarkdownConfigArgs<Ctx>) => void;
export type ActionMarkdownConfigArgs<Ctx extends O> = {
  ctx: Ctx;
  markdown(value: string): ActionMarkdownConfigArgs<Ctx>;
};
