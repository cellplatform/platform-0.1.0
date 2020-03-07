// import { ICommand } from './types';
import * as t from './types';

// export type ICommandTreeVisitorArgs<T extends ICommand> = {
//   command: T;
//   stop: () => void;
// };
// export type CommandTreeVisitor<T extends ICommand> = (e: ICommandTreeVisitorArgs<T>) => void;
// export type ICommandTreeVisitorResult = { stopped: boolean };
// export type CommandTreeFilter<T extends ICommand> = (command: T) => boolean;

/**
 * Walks the Command tree (recursive descent).
 */
export function walk<T extends t.ICommand = t.ICommand>(
  command: T,
  fn: t.CommandTreeVisitor<T>,
): t.ICommandTreeVisitorResult {
  let stopped = false;
  const done = () => ({ stopped });

  // Invoke visitor on the given level.
  const e: t.ICommandTreeVisitorArgs<T> = { command, stop: () => (stopped = true) };
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
export function find<T extends t.ICommand = t.ICommand>(command: T, fn: t.CommandTreeFilter<T>) {
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
export function count(command: t.ICommand) {
  let count = 0;
  walk(command, () => count++);
  return count;
}

/**
 * Finds the parent of the given child.
 */
export function parent<T extends t.ICommand = t.ICommand>(root: T, child: number | string | T) {
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
 * Builds a path to the given command.
 */
export function toPath<T extends t.ICommand = t.ICommand>(
  root: T,
  target: number | string | t.ICommand,
): T[] {
  const cmd = find(root, e => isMatch(e, target)); // Ensure the command exists within the root tree.
  let result: T[] = [];
  if (cmd) {
    const add = (cmd: T) => {
      result = [cmd, ...result];
      const next = parent(root, cmd);
      if (next) {
        add(next); // <== RECURSION
      }
    };
    add(cmd);
  }
  return result;
}

/**
 * Finds a command from the given path string.
 */
export function fromPath<T extends t.ICommand = t.ICommand>(
  root: T,
  path: (string | number | boolean)[],
  options: { strict?: boolean } = {},
): T | undefined {
  const { strict = false } = options;

  const level = (cmd: T, parts: (string | number | boolean)[]): T | undefined => {
    const name = parts[0];
    if (!name || name !== cmd.name) {
      return;
    }
    if (parts.length <= 1) {
      return cmd; // Match found.
    }

    parts = parts.slice(1);
    for (const child of cmd.children as T[]) {
      const res = level(child, parts); // <== RECURSION
      if (res) {
        return res;
      }
    }
    return strict ? undefined : cmd;
  };

  return level(root, path);
}

/**
 * Finds a command from a sequence of parameter values.
 */
export function fromParams<T extends t.ICommand = t.ICommand>(
  root: T,
  params: string | string[],
): T | undefined {
  const level = (cmd: T, parts: string[]): T | undefined => {
    const name = parts[0];
    if (!name || name !== cmd.name) {
      return;
    }
    if (parts.length <= 1) {
      return cmd; // Match found.
    }

    parts = parts.slice(1);
    for (const child of cmd.children as T[]) {
      const res = level(child, parts); // <== RECURSION
      if (res) {
        return res;
      }
    }
    return;
  };

  params = Array.isArray(params) ? params : params.split(' ');
  return level(root, params);
}

/**
 * [Helpers]
 */

function isMatch(command: t.ICommand, value: number | string | t.ICommand) {
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
