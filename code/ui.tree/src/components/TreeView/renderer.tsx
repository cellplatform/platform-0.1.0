import { t } from '../../common';

/**
 * Executes factory methods for rendering assets within the tree.
 *
 * NB: Following the "closest in the cascade wins" pattern, any explicit
 *     factory methods given to the <TreeView> will be used in preference
 *     to any event based factory/render requests.  Only if an explicitly
 *     passed factory does not yeild a result will the events be fired.
 */
export function renderer(args: {
  fire: t.FireEvent<t.TreeViewEvent>;
  renderIcon?: t.RenderTreeIcon;
  renderNodeBody?: t.RenderTreeNodeBody;
  renderPanel?: t.RenderTreePanel;
}) {
  const { fire } = args;

  const icon: t.RenderTreeIcon = (e) => {
    let el = args.renderIcon ? args.renderIcon(e) : undefined;
    if (!el) {
      const payload: t.ITreeViewRenderIcon = {
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
      const payload: t.ITreeViewRenderNodeBody = {
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
      const payload: t.ITreeViewRenderPanel = {
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

  return { icon, nodeBody, panel };
}
