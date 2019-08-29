import { props, t } from '../common';

export function createSplash(initial: t.ISplash) {
  return props.observable<t.ISplash>(initial);
}
