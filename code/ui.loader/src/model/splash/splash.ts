import { props, t } from '../../common';

const DEFAULT: t.ISplash = { isVisible: false, isSpinning: true };

export function create(initial: Partial<t.ISplash>) {
  return props.observable<t.ISplash>({ ...DEFAULT, ...initial });
}
