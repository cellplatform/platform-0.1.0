import { t, defaultValue } from '../common';
import { Builder } from '@platform/cell.module';

type O = Record<string, unknown>;
type M = t.ITreeviewNode;

/**
 * Builder tools for a TreeView.
 * Generics:
 *    <M> model
 *    <P> parent builder
 */
export const tree: t.ViewBuilderTree = {
  node<P extends O>(model: t.BuilderModel<any>, parent?: t.BuilderChain<any>) {
    type A = t.ViewBuilderTreeNode<P>;
    const handlers = treeHandlers<P>();
    return Builder.create<M, A>({ model, handlers, parent });
  },
};

/**
 * Builder handlers for manipulating a treeview node.
 */
export const treeHandlers = <P extends O>() => {
  type A = t.ViewBuilderTreeNode<P>;

  const handlers: t.BuilderHandlers<M, A> = {
    parent: (args) => args.builder.parent,

    label(args) {
      const value = format.string(args.params[0], { default: '', trim: true });
      args.model.change((draft) => (treeview(draft).label = value));
    },

    icon(args) {
      args.model.change((draft) => (treeview(draft).icon = args.params[0]));
    },

    title(args) {
      const value = format.string(args.params[0], { default: '', trim: true });
      args.model.change((draft) => (treeview(draft).title = value));
    },

    description(args) {
      const value = format.string(args.params[0], { default: '', trim: true });
      args.model.change((draft) => (treeview(draft).description = value));
    },

    opacity(args) {
      const value = format.number(args.params[0], { default: 1, min: 0, max: 1 });
      args.model.change((draft) => (treeview(draft).opacity = value));
    },
  };

  return handlers;
};

/**
 * [Helpers]
 */

const format = {
  number(input: any, options: { min?: number; max?: number; default?: number } = {}) {
    let number = typeof input === 'number' ? input : defaultValue(options.default, 0);
    number = options.min === undefined ? number : Math.max(options.min, number);
    number = options.max === undefined ? number : Math.min(options.max, number);
    return number;
  },

  string(input: any, options: { default?: string; trim?: boolean } = {}) {
    let text = typeof input === 'string' ? input : defaultValue(options.default, undefined);
    text = options.trim ? text.trim() : text;

    return text;
  },
};

function treeview(state: M) {
  return model(state).treeview;
}

function model(state: M) {
  const res = {
    get props() {
      return state.props || (state.props = {});
    },
    get treeview() {
      const props = res.props;
      return props.treeview || (props.treeview = {});
    },
  };
  return res;
}
