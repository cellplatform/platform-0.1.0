export * from './util.objectToCells';
export * from './util.fetch';
export * from './Cache';
export * from './ErrorList';

export const formatNs = (input: string = '') => {
  input = input.trim();
  return !input ? '' : input.includes(':') ? input : `ns:${input}`;
};
