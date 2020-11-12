import { t, defaultValue, R, fs } from '../common';

type A = t.CompilerModelRedirectAction;
type G = t.CompilerModelRedirectGrant;

type Path = {
  path: string;
  grant: G | undefined;
  isAllowed: boolean;
};

/**
 * Helpers for calculating redirection rules.
 */
export function Redirects(list: G[] = []) {
  return {
    list,

    /**
     * De-dupes, overrides (later items) and sorts execution order.
     *
     * Order:
     *    APPLY => DENY
     *
     * When applying rules in order DENY's will come later and override
     * any earlier APPLY options.
     */
    sortAndOrder(): G[] {
      const groupBy = R.groupBy<G>((b) => b.grep || '');
      const grouped = groupBy(list);
      const items = Object.keys(grouped).reduce((acc, key) => {
        const list = grouped[key];
        acc.push(list[list.length - 1]);
        return acc;
      }, [] as G[]);
      return R.sortWith([R.ascend(R.prop('action'))])(items as any);
    },

    /**
     * Resolve whether a path will allow redirects.
     */
    path(path: string, options: { defaultAllow?: boolean } = {}): Path {
      path = typeof path !== 'string' ? '' : path.trim();
      const defaultAllow = defaultValue(options.defaultAllow, true);
      const grant = list
        .reverse() // NB: Catch DENY
        .filter((item) => typeof item.grep === 'string')
        .find((item) => fs.match(item.grep as string).path(path));

      const isAllowed =
        !grant || grant.action === undefined ? defaultAllow : grant.action === 'ALLOW';

      return {
        path,
        grant,
        isAllowed,
      };
    },
  };
}
