export const is = {
  observable: (input: any) => hasAll(input, 'subscribe'),
  stateObject: (input: any) => hasAll(input, 'change'),
};

const hasAll = (input: any, ...keys: string[]) => {
  return (
    input !== null &&
    typeof input === 'object' &&
    keys.every((key) => typeof input[key] === 'function')
  );
};
