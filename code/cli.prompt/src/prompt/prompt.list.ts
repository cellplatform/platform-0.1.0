import { inquirer, t } from '../common';

export * from '../types';

/**
 * Prompts the user for selection from a list.
 */
export async function list<V = string>(args: {
  message: string;
  items: (string | t.IPromptListOption)[];
  pageSize?: number;
  type?: 'list' | 'checkbox';
}) {
  const { message, pageSize, type = 'list' } = args;

  const choices: t.DistinctChoice<any>[] = args.items.map((item) => {
    return typeof item === 'string'
      ? item.startsWith('---')
        ? new inquirer.Separator()
        : { name: item }
      : item;
  });

  // inquirer

  const question: t.DistinctQuestion = {
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
 * Prompts the user with a list of checkboxes (ie. single-select).
 */
export async function radio<V = string>(args: {
  message: string;
  items: (string | t.IPromptListOption)[];
  pageSize?: number;
}) {
  return list<V>({ ...args, type: 'list' });
}

/**
 * Prompts the user with a list of checkboxes (ie. multi-select).
 */
export async function checkbox<V = string>(args: {
  message: string;
  items: (string | t.IPromptListOption)[];
  pageSize?: number;
}) {
  return list<V[]>({ ...args, type: 'checkbox' });
}
