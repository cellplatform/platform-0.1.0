export * from '../../../common/types';
export * from '../types';

import { DocSet } from 'automerge';

export type Docs = DocSet<Doc>;

export type Doc = {
  count: number;
  text?: string;
};
