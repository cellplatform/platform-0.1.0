export * from '../web/common';

export const timeoutWrangler = (defaultTimeout?: number) => {
  return (options: { timeout?: number } = {}) => {
    return options.timeout ?? defaultTimeout ?? 3000;
  };
};
