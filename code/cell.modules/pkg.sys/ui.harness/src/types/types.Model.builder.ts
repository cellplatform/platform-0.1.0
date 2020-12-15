import { t } from './common';

type A = ActionModelBuilder;

export type ActionModelFactory = {
  model(name: string): t.ActionModelState;
  builder(input?: string | t.ActionModelState | t.ActionModel): A;
};

/**
 * Model Builder API
 */
export type ActionModelBuilder = t.BuilderChain<ActionModelMethods>;

export type ActionModelMethods = {
  toObject(): t.ActionModel;
};
