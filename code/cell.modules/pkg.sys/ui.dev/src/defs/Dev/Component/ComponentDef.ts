import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { Component } from '../../../components/Action.Dev';
import { Model, R, t } from '../common';
import { config } from './ComponentDef.config';

type T = t.ActionComponent;
type E = t.IActionComponentRenderEvent;

export const ComponentDef: t.ActionDef<T, E> = {
  kind: 'dev/component',
  Component,

  config: {
    method: 'component',
    handler(args) {
      const { item } = config(args.ctx, args.params);
      args.actions.change((draft) => draft.items.push(item));
    },
  },

  listen(args) {
    const { actions } = args;
    const { item } = Model.item<T>(actions, args.id);
    const namespace = actions.state.namespace;

    const fireRender = () => {
      const ctx = actions.state.ctx.current;
      if (ctx && item.handler) {
        const el = item.handler({ ctx });
        args.fire({
          type: 'sys.ui.dev/action/Component/render',
          payload: { namespace, item, el },
        });
      }
    };

    actions.event.changed$
      .pipe(
        filter(() => Boolean(item.handler)),
        debounceTime(0),
        distinctUntilChanged((prev, next) => R.equals(prev.to.ctx.current, next.to.ctx.current)),
      )
      .subscribe((e) => fireRender());
  },
};
