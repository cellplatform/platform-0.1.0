import { t } from '../common';
import { Builder as BuilderBase } from '@platform/cell.module';
import { tree } from './builder.tree';

export const Builder: t.ViewBuilder = {
  ...BuilderBase,
  tree,
};
