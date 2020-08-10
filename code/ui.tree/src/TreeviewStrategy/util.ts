import { t } from '../common';

type C = t.ITreeviewStrategyContext;

export function toContext(input: C | (() => C)) {
  return typeof input === 'function' ? input() : input;
}
