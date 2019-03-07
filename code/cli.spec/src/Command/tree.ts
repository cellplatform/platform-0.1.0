import { ICommand } from './types';

export type ICommandTreeVisitorArgs<T extends ICommand> = {
  command: T;
  stop: () => void;
};
export type CommandTreeVisitor<T extends ICommand> = (e: ICommandTreeVisitorArgs<T>) => void;
export type ICommandTreeVisitorResult = { stopped: boolean };
export type CommandTreeFilter<T extends ICommand> = (command: T) => boolean;

/**
 * Walks the Command tree (recursive descent).
 */
export function walk<T extends ICommand = ICommand>(
  command: T,
  fn: CommandTreeVisitor<T>,
): ICommandTreeVisitorResult {
  let stopped = false;
  const done = () => ({ stopped });

  // Invoke visitor on the given level.
  const e: ICommandTreeVisitorArgs<T> = { command, stop: () => (stopped = true) };
  fn(e);

  // Invoke visitor for each child.
  for (const child of command.children) {
    if (stopped) {
      return done();
    }
    stopped = walk<T>(child as T, fn).stopped; // <== RECURSION
  }

  // Finish up.
  return done();
}

/**
 * Search for a specific command anywhere within the tree.
 */
export function find<T extends ICommand = ICommand>(command: T, fn: CommandTreeFilter<T>) {
  let result: T | undefined;
  walk(command, e => {
    if (fn(e.command)) {
      e.stop();
      result = e.command;
    }
  });
  return result;
}

/**
 * Count the number of descendent commands within the tree.
 */
export function count(command: ICommand) {
  let count = 0;
  walk(command, () => count++);
  return count;
}

/**
 * Finds the parent of the given child.
 */
export function parent<T extends ICommand = ICommand>(root: T, child: number | string | T) {
  let result: T | undefined;
  walk(root, e => {
    const contains = e.command.children.some(item => isMatch(item, child));
    if (contains) {
      e.stop();
      result = e.command;
    }
  });
  return result;
}

/**
 * [Helpers]
 */

function isMatch(command: ICommand, value: number | string | ICommand) {
  if (typeof value === 'number' && command.id === value) {
    return true;
  }
  if (typeof value === 'string' && command.name === value) {
    return true;
  }
  if (typeof value === 'object' && value.id === command.id) {
    return true;
  }
  return false;
}
