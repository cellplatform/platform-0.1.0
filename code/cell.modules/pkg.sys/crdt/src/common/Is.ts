import { Automerge } from './libs';

export const Is = {
  automergeObject(input: any) {
    return typeof Automerge.getObjectId(input) === 'string';
  },
};
