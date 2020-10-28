import { t, StateObject, fs } from './common';

/**
 * Run [beforeCompile] handlers.
 */
export function beforeCompile(args: {
  model: t.CompilerModel;
  toConfig: (input: t.CompilerModel) => t.WpConfig;
  handlers?: t.BeforeCompile[];
}) {
  let model = args.model;
  let webpack = args.toConfig(model);

  const handlers = toRoot(model).reduce((acc, next) => {
    return [...acc, ...(next.beforeCompile || [])];
  }, args.handlers || []);

  if (handlers.length > 0) {
    const e: t.BeforeCompileArgs = {
      name: model.name,
      model,
      toObject: StateObject.toObject,
      modifyModel(fn) {
        const obj = StateObject.create<t.CompilerModel>(model);
        obj.change(fn);
        model = obj.state;
        webpack = args.toConfig(obj.state);
      },
      modifyWebpack(fn) {
        const obj = StateObject.create<t.WpConfig>(webpack);
        obj.change(fn);
        webpack = obj.state;
      },
    };

    handlers.forEach((fn) => fn(e));
  }

  return { model, webpack };
}

/**
 * Run [afterCompile] handlers.
 */
export function afterCompile(args: {
  model: t.CompilerModel;
  webpack: t.WpConfig;
  compilation: t.WpCompilation;
}) {
  const { model, webpack, compilation } = args;
  const name = model.name;
  const dir = compilation.outputOptions.path || '';

  const handlers = toRoot(model).reduce((acc, next) => {
    return [...acc, ...(next.afterCompile || [])];
  }, [] as t.AfterCompile[]);

  handlers.forEach((fn) => fn({ name, model, webpack, compilation, dir }));
}

/**
 * [Helpers]
 */

export function toRoot(model: t.CompilerModel, list: t.CompilerModel[] = []) {
  list.push(model);
  const parent = model.parent();
  if (parent) {
    toRoot(parent, list); // <== RECURSION 🌳
  }
  return list;
}
