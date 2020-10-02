import { t } from '../common';
import { Builder } from '@platform/cell.module';

const format = Builder.format;

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
  /**
   * Treeview Node.
   */
  const node: t.BuilderHandlers<M, t.ViewBuilderTreeNode<P>> = {
    parent: (args) => args.builder.parent,

    label(args) {
      const value = format.string(args.params[0], { trim: true });
      args.model.change((draft) => (treeview(draft).label = value));
    },

    icon(args) {
      const input = args.params[0];
      const value = typeof input === 'string' ? format.string(input, { trim: true }) : input;
      args.model.change((draft) => (treeview(draft).icon = value));
    },

    title(args) {
      const value = format.string(args.params[0], { trim: true });
      args.model.change((draft) => (treeview(draft).title = value));
    },

    description(args) {
      const value = format.string(args.params[0], { trim: true });
      args.model.change((draft) => (treeview(draft).description = value));
    },

    isEnabled(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (treeview(draft).isEnabled = value));
    },

    isVisible(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (treeview(draft).isVisible = value));
    },

    isBold(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (treeview(draft).isBold = value));
    },

    isSpinning(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (treeview(draft).isSpinning = value));
    },

    opacity(args) {
      const value = format.number(args.params[0], { default: 1, min: 0, max: 1 });
      args.model.change((draft) => (treeview(draft).opacity = value));
    },

    padding(args) {
      let input = args.params[0];
      if (Array.isArray(input)) {
        if (input.length === 2) {
          // Convert [vertical,horizontal] to [top, right, bottom left].
          input = [input[0], input[1], input[0], input[1]];
        }
        if (input.length > 4) {
          input = input.slice(0, 4);
        }
      }
      const value = !Array.isArray(input)
        ? format.number(input, { min: 0 })
        : input.map((input) => format.number(input, { min: 0 }));
      args.model.change((draft) => (treeview(draft).padding = value));
    },

    marginTop(args) {
      const value = format.number(args.params[0], { min: 0 });
      args.model.change((draft) => (treeview(draft).marginTop = value));
    },

    marginBottom(args) {
      const value = format.number(args.params[0], { min: 0 });
      args.model.change((draft) => (treeview(draft).marginBottom = value));
    },

    header: {
      kind: 'object',
      builder: (args) => args.create<M, t.ViewBuilderTreeNodeHeader<P>>(header),
    },

    inline: {
      kind: 'object',
      builder: (args) => args.create<M, t.ViewBuilderTreeNodeInline<P>>(inline),
    },

    chevron: {
      kind: 'object',
      builder: (args) => args.create<M, t.ViewBuilderTreeNodeChevon<P>>(chevron),
    },
  };

  /**
   * Header.
   */
  const header: t.BuilderHandlers<M, t.ViewBuilderTreeNodeHeader<P>> = {
    parent: (args) => args.builder.parent,
    isVisible(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (model(draft).header.isVisible = value));
    },
    parentButton(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (model(draft).header.showParentButton = value));
    },
    marginBottom(args) {
      const value = format.number(args.params[0], { min: 0 });
      args.model.change((draft) => (model(draft).header.marginBottom = value));
    },
    height(args) {
      const value = format.number(args.params[0], { min: 0 });
      args.model.change((draft) => (model(draft).header.height = value));
    },
  };

  /**
   * Inline.
   */
  const inline: t.BuilderHandlers<M, t.ViewBuilderTreeNodeInline<P>> = {
    parent: (args) => args.builder.parent,
    isVisible(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (model(draft).inline.isVisible = value));
    },
    isOpen(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (model(draft).inline.isOpen = value));
    },
  };

  /**
   * Chevron.
   */
  const chevron: t.BuilderHandlers<M, t.ViewBuilderTreeNodeChevon<P>> = {
    parent: (args) => args.builder.parent,
    isVisible(args) {
      const value = format.boolean(args.params[0]);
      args.model.change((draft) => (model(draft).chevron.isVisible = value));
    },
  };

  return node;
};

/**
 * [Helpers]
 */

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
    get header() {
      const treeview = res.treeview;
      return treeview.header || (treeview.header = {});
    },
    get inline() {
      const treeview = res.treeview;
      return treeview.inline || (treeview.inline = {});
    },
    get chevron() {
      const treeview = res.treeview;
      return treeview.chevron || (treeview.chevron = {});
    },
  };
  return res;
}
