import { t } from '../../common';
import { produce } from 'immer';

type N = t.ITreeviewNode;

/**
 * Executes factory methods for rendering assets within the tree.
 *
 * NB: Following the "closest in the cascade wins" pattern, any explicit
 *     factory methods given to the <TreeView> will be used in preference
 *     to any event based factory/render requests.  Only if an explicitly
 *     passed factory does not yeild a result will the events be fired.
 */
export function renderer(args: {
  fire: t.FireEvent<t.TreeviewEvent>;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  renderPanel?: t.RenderTreePanel;
  renderHeader?: t.RenderTreeHeader;
}): t.ITreeviewRenderer {
  const { fire } = args;

  const icon: t.RenderTreeIcon = (e) => {
    let el = args.renderIcon ? args.renderIcon(e) : undefined;
    if (!el) {
      const payload: t.ITreeviewRenderIcon = {
        ...e,
        isHandled: false,
        render(response) {
          payload.isHandled = response ? true : payload.isHandled;
          el = response;
        },
      };
      fire({ type: 'TREEVIEW/render/icon', payload });
    }
    return el;
  };

  const nodeBody: t.RenderTreeNodeBody = (e) => {
    let el = args.renderNodeBody ? args.renderNodeBody(e) : undefined;
    if (!el) {
      const payload: t.ITreeviewRenderNodeBody = {
        ...e,
        isHandled: false,
        render(response) {
          payload.isHandled = response ? true : payload.isHandled;
          el = response;
        },
      };
      fire({ type: 'TREEVIEW/render/nodeBody', payload });
    }
    return el;
  };

  const panel: t.RenderTreePanel = (e) => {
    let el = args.renderPanel ? args.renderPanel(e) : undefined;
    if (!el) {
      const payload: t.ITreeviewRenderPanel = {
        ...e,
        isHandled: false,
        render(response) {
          payload.isHandled = response ? true : payload.isHandled;
          el = response;
        },
      };
      fire({ type: 'TREEVIEW/render/panel', payload });
    }
    return el;
  };

  const header: t.RenderTreeHeader = (e) => {
    let el = args.renderHeader ? args.renderHeader(e) : undefined;
    if (!el) {
      const payload: t.ITreeviewRenderHeader = {
        ...e,
        isHandled: false,
        render(response) {
          payload.isHandled = response ? true : payload.isHandled;
          el = response;
        },
      };
      fire({ type: 'TREEVIEW/render/header', payload });
    }
    return el;
  };

  const beforeRenderer = <T extends t.TreeviewBeforeRenderEvent>(type: T['type']) => {
    return (e: t.ITreeviewBeforeRenderNodeProps) => {
      let props = e.node.props?.treeview || {};

      const payload: T['payload'] = {
        ...e,
        change(fn) {
          props = produce(props, (draft) => {
            fn(draft);
            return undefined; // NB: No return value (to prevent replacement).
          });
        },
      };

      fire({ type, payload } as T);

      return props;
    };
  };

  const beforeRender: t.ITreeviewRenderer['beforeRender'] = {
    node: beforeRenderer('TREEVIEW/beforeRender/node'),
    header: beforeRenderer('TREEVIEW/beforeRender/header'),
  };

  return { icon, nodeBody, panel, header, beforeRender };
}
