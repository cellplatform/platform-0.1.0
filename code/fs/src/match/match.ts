import * as minimatch from 'minimatch';

export type IMatchOptions = {
  dot?: boolean;
  nobrace?: boolean;
  noglobstar?: boolean;
  flipNegate?: boolean;
};

/**
 * Path patcher.
 * https://github.com/isaacs/minimatch
 */
export function match(pattern: string, options?: IMatchOptions) {
  const base = options || {};
  return {
    path(value: string, options: IMatchOptions = {}) {
      return minimatch(value, pattern, { ...base, ...options });
    },

    base(value: string, options: IMatchOptions = {}) {
      return minimatch(value, pattern, { ...base, ...options, matchBase: true });
    },
  };
}
