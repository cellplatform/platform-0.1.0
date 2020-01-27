import { fs, log } from '../common';
import { list } from './prompt.list';

/**
 * Prompt user for selection of a directory.
 */
export function paths(
  parentDirOrPaths: string | string[],
  options: { pageSize?: number; message?: string } = {},
) {
  const { pageSize = 15 } = options;

  const toPaths = async (input: string | string[]) => {
    return Array.isArray(input)
      ? input
      : fs.glob.find(fs.join(fs.resolve(input), '*'), { includeDirs: true });
  };

  const toPathList = (paths: string[]) => {
    return paths.map(path => {
      const dir = fs.dirname(path);
      const parentName = fs.basename(dir);
      const dirname = fs.basename(path);
      return {
        name: log.gray(`• ${parentName}/${log.white(dirname)}`),
        value: path,
      };
    });
  };

  const ALL = '__ALL__';
  const toItems = async (input: string | string[]) => {
    const paths = await toPaths(input);
    const options = [{ name: 'all', value: ALL, type: 'list' }, '---', ...toPathList(paths)];
    const count = paths.length;
    const isEmpty = count === 0;
    return { options, paths, count, isEmpty };
  };

  const runPrompt = async (type: 'list' | 'checkbox', message?: string) => {
    const items = await toItems(parentDirOrPaths);

    if (items.isEmpty) {
      log.info.gray(`<empty>`);
      return [];
    }

    message = message || options.message || 'path';

    const res = await list({
      message,
      items: items.options,
      pageSize,
      type,
    });

    const selection = Array.isArray(res) ? [].concat(...res) : [res];
    const isAll = selection[0] === ALL;

    return isAll ? items.paths : selection;
  };

  return {
    async radio(message?: string) {
      return runPrompt('list', message);
    },
    async checkbox(message?: string) {
      return runPrompt('checkbox', message);
    },
  };
}
