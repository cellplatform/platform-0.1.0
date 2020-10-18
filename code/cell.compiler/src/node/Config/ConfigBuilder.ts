import { Builder, DEFAULT, StateObject, t } from '../common';
import { handlers } from './handlers';

type O = Record<string, unknown>;

const format = Builder.format;
/**
 * Configuration builder factory.
 */
export const ConfigBuilder: t.CompilerModelFactory = {
  model(name) {
    name = format.string(name, { trim: true }) || '';
    if (!name) {
      throw new Error(`Configuration must be named`);
    }
    const initial = { ...DEFAULT.CONFIG, name } as t.CompilerModel;
    return StateObject.create<t.CompilerModel>(initial);
  },

  builder(input) {
    const model = (typeof input === 'object'
      ? StateObject.isStateObject(input)
        ? input
        : StateObject.create<t.CompilerModel>(input as any)
      : ConfigBuilder.model(input)) as t.CompilerModelState;
    return Builder.create<t.CompilerModel, t.CompilerModelBuilderMethods>({ model, handlers });
  },
};
