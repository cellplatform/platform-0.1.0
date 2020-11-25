import { fs, t } from '../common';
import { GrepList } from './util.GrepList';

type A = t.CompilerModelFileAccess;
type P = t.CompilerModelFileAccessPermission;

const DEFAULT_ACCESS: P = 'private';

type Path = {
  path: string;
  permission: P;
  public: boolean;
  private: boolean;
};

/**
 * Helpers for calculating file-access rules.
 */
export function FileAccess(input: A[] = []) {
  const list = GrepList(input);

  if (list.negations.length > 0) {
    throw new Error(`Path negations ("!") not supported.`);
  }

  const findMatch = (path: string) => {
    const matches = [...list.all]
      .reverse()
      .filter((item) => (item.grep ? fs.match(item.grep).path(path) : false));
    if (matches.length === 0) {
      return undefined;
    } else {
      return matches[0];
    }
  };

  return {
    list: list.all,

    /**
     * Resolve the permission of the given path.
     */
    path(input?: string): Path {
      const path = typeof input !== 'string' ? '' : input.trim();
      const match = findMatch(path);
      const permission = match?.permission ? match.permission : DEFAULT_ACCESS;
      return {
        path,
        permission,
        public: permission === 'public',
        private: permission === 'private',
      };
    },
  };
}
