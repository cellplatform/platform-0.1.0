import { inquirer } from './common';

export type IPromptListOption<V = string> = { name: string; value?: V };

/**
 * Prompts the user for selection from a list.
 */
export async function list<V>(args: {
  message: string;
  items: Array<string | IPromptListOption<V>>;
  pageSize?: number;
}) {
  const { message, pageSize } = args;
  const choices: Array<inquirer.DistinctChoice<any>> = args.items.map(item => {
    return typeof item === 'string'
      ? item.startsWith('---')
        ? new inquirer.Separator()
        : { name: item }
      : item;
  });
  const question: inquirer.DistinctQuestion = {
    type: 'list',
    name: 'result',
    message,
    choices,
    pageSize,
  };
  const { result } = (await inquirer.prompt(question)) as { result: V };
  return result;
}
