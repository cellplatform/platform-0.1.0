import { inquirer } from './common';

export type IPromptListOption<V = string> = { name: string; value?: V };
export type IPromptCheckboxOption<V = string> = { name: string; value?: V };

/**
 * Prompts the user for a simple text value.
 */
export async function text(args: { message: string; default?: string }) {
  const { message } = args;
  const question: inquirer.InputQuestion = {
    type: 'input',
    name: 'result',
    message,
    default: args.default,
  };
  const { result } = (await inquirer.prompt(question)) as { result: string };
  return result;
}

/**
 * Prompts the user for selection from a list.
 */
export async function list<V>(args: {
  message: string;
  items: Array<string | IPromptListOption<V>>;
  pageSize?: number;
  type?: 'list' | 'checkbox';
}) {
  const { message, pageSize, type = 'list' } = args;
  const choices: Array<inquirer.DistinctChoice<any>> = args.items.map(item => {
    return typeof item === 'string'
      ? item.startsWith('---')
        ? new inquirer.Separator()
        : { name: item }
      : item;
  });
  const question: inquirer.DistinctQuestion = {
    type,
    name: 'result',
    message,
    choices,
    pageSize,
  };
  const { result } = (await inquirer.prompt(question)) as { result: V };
  return result;
}

/**
 * Prompts the user with a list of checkboxes (ie. multi-select).
 */
export async function checkbox<V>(args: {
  message: string;
  items: Array<string | IPromptCheckboxOption<V>>;
  pageSize?: number;
}) {
  const res = await list({ ...args, type: 'checkbox' });
  return (res as unknown) as V[];
}
