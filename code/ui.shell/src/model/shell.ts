import { props, t } from '../common';

export function create() {
  return {
    body: props.observable<t.IShellBody>({ el: undefined }),
    aside: props.observable<t.IShellAside>({ el: undefined }),
  };
}
