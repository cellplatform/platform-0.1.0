import { ICommand } from './types';

export type ICommandTreeVisitorArgs = {
  command: ICommand;
  stop: () => void;
};
export type CommandTreeVisitor = (e: ICommandTreeVisitorArgs) => void;
export type CommandTreeFilter = (command: ICommand) => boolean;

/**
 * Walks the Command tree (recursive descent).
 */
export function walk(command: ICommand, fn: CommandTreeVisitor) {
  let stopped = false;
  const done = () => ({ stopped });

  // Invoke visitor on the given level.
  const e: ICommandTreeVisitorArgs = { command, stop: () => (stopped = true) };
  fn(e);

  // Invoke visitor for each child.
  for (const child of command.children) {
    if (stopped) {
      return done();
    }
    stopped = walk(child, fn).stopped; // <== RECURSION
  }

  // Finish up.
  return done();
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
 * Search for a specific command anywhere within the tree.
 */
export function find(command: ICommand, fn: CommandTreeFilter) {
  let result: ICommand | undefined;
  walk(command, e => {
    if (fn(e.command)) {
      e.stop();
      result = e.command;
    }
  });
  return result;
}
