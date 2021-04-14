import { slug, t } from '../common';

type O = Record<string, unknown>;

/**
 * A [Boolean] switch configurator.
 */
export function config<Ctx extends O>(ctx: Ctx, params: any[]) {
  const item: t.ActionComponent = { id: slug(), kind: 'dev/component' };

  if (typeof params[0] === 'function') {
    item.handler = params[0];
  }

  return { item };
}
