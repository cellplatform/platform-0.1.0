import { props, t } from '../common';

export function create() {
  const body = props.observable<t.IShellBodyState>({ el: undefined });
  const aside = props.observable<t.IShellAsideState>({ el: undefined });

  const model: t.IShellState = {
    body,
    aside,
  };
  return model;
}
