export const Format = {
  path: {
    trimPrefix(input: string) {
      return (input ?? '').trim().replace(/^path\:/, '');
    },
    ensurePrefix(input: string) {
      return `path:${Format.path.trimPrefix(input)}`;
    },
  },
};
