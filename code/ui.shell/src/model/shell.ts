import { props, t } from '../common';

const DEFAULT: t.IShell = {};

export function create(initial: Partial<t.IShell>) {
  return props.observable<t.IShell>({ ...DEFAULT, ...initial });
}
