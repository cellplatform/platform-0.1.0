import { inquirer } from '../common';

export type IOption<V = string> = { name: string; value?: V };

/**
 * Prompts the users for input.
 */
export async function list<V>(args: { message: string; items: Array<string | IOption<V>> }) {
  const { message } = args;
  const choices: Array<IOption<V>> = args.items.map(item => {
    return typeof item === 'string' ? { name: item } : item;
  });
  const question: inquirer.DistinctQuestion = {
    type: 'list',
    name: 'result',
    message,
    choices,
  };
  const { result } = (await inquirer.prompt(question)) as { result: V };
  return result;
}
