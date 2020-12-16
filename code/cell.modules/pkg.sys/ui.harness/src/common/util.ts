import { Builder, StateObject } from './libs';
import * as t from './types';

/**
 * Converts an input to a model.
 */
export function toActionPanelModel<Ctx>(input: any): t.ActionModel<Ctx> | undefined {
  if (Builder.isBuilder(input)) {
    return (input as t.ActionModelBuilder<Ctx>).toObject();
  }

  if (StateObject.isStateObject(input)) {
    return (input as any).state;
  }

  if (input === undefined || input === null || Array.isArray(input)) {
    return undefined;
  }

  return typeof input === 'object' ? input : undefined;
}
