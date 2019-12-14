export type IPromptListOption = { name: string; value?: any };

export type IPrompt = {
  text: PromptText;
};

export type PromptText = (args: { message: string; default?: string }) => Promise<string>;
