import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

import { Component } from '../../../ui/Action.Dev';
import { Model, R, t, Handler } from '../common';
import { config } from './ComponentDef.config';

type T = t.ActionComponent;
type E = t.IActionComponentRenderEvent;
type S = t.ActionHandlerSettings<any>;

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
    const { actions, id } = args;
    const { item } = Model.item<T>(actions, id);
    const namespace = actions.state.namespace;

    const getEnv = (state: t.ActionsModel<any>) => {
      const env: Required<t.ActionsModelEnvProps> = {
        host: {},
        layout: {},
        actions: {},
        ...state.env.viaSubject,
        ...state.env.viaSubject,
      };

      return env;
    };

    const getProps = <C>(ctx: C) => {
      const change: t.ActionComponentChange<C> = {
        ctx(fn) {
          actions.change((draft) => fn(draft.ctx.current));
          return props;
        },
        settings(args) {
          actions.change((draft) => {
            const env = draft.env.viaAction || (draft.env.viaAction = {});
            Handler.settings.update(env, args);
          });
          return props;
        },
      };

      const env = getEnv(actions.state);
      const props: t.ActionComponentHandlerArgs<C> = { ctx, change, env };
      return props;
    };

    const fireRender = () => {
      const state = actions.state;
      const ctx = state.ctx.current;

      if (ctx && item.handler) {
        const props = getProps(ctx);
        const element = item.handler(props);
        args.fire({
          type: 'sys.ui.dev/action/Component/render',
          payload: { namespace, item, element },
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
