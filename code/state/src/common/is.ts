export const is = {
  observable: (input: any) => hasAll(input, 'subscribe'),
  stateObject: (input: any) => hasAll(input, 'change', 'dispatch', 'action'),
};

const hasAll = (input: any, ...keys: string[]) => {
  return typeof input === 'object' && keys.every((key) => typeof input[key] === 'function');
};
