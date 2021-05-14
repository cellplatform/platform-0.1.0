import { Builder, DEFAULT, StateObject, t } from '../common';
import { handlers } from './handlers';

const format = Builder.format;

/**
 * Configuration builder factory.
 */
export const ConfigBuilder: t.CompilerModelFactory = {
  /**
   * Create a new data-model.
   */
  model(name) {
    name = format.string(name, { trim: true }) || '';
    if (!name) {
      throw new Error(`Configuration must be named`);
    }
    const initial = { ...DEFAULT.CONFIG, name } as t.CompilerModel;
    return StateObject.create<t.CompilerModel>(initial);
  },

  /**
   * Create a new data-model builder API.
   */
  builder(input) {
    const model = (
      typeof input === 'object'
        ? StateObject.isStateObject(input)
          ? input
          : StateObject.create<t.CompilerModel>(input as any)
        : ConfigBuilder.model(input || DEFAULT.BASE)
    ) as t.CompilerModelState;
    return Builder.create<t.CompilerModel, t.CompilerModelMethods>({ model, handlers });
  },
};
