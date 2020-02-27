export type IPromptListOption = { name: string; value?: any };

/**
 * API for prompting for user input.
 */
export type IPrompt = {
  text: PromptText;
  list: PromptList;
};

/**
 * Prompts the user for a simple text value.
 */
export type PromptText = (args: { message: string; default?: string }) => Promise<string>;

/**
 * Prompts the user for selection from a list.
 */
export type PromptList = <V = string>(args: {
  message: string;
  items: (string | IPromptListOption)[];
  pageSize?: number;
  type?: 'list' | 'checkbox';
}) => Promise<V>;
