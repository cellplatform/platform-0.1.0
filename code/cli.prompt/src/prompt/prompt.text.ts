import { inquirer, t } from '../common';

/**
 * Prompts the user for a simple text value.
 */
export async function text(args: { message: string; default?: string }) {
  const { message } = args;
  const question: t.InputQuestion = {
    type: 'input',
    name: 'result',
    message,
    default: args.default,
  };
  const { result } = (await inquirer.prompt(question)) as { result: string };
  return result;
}
