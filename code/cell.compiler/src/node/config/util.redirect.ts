import { fs, R, t } from '../common';

type G = t.CompilerModelRedirect;

type Path = {
  path: string;
  grant: G | undefined;
  isAllowed: boolean;
  flag?: boolean;
};

const DEFAULT_ALLOW = true;

/**
 * Helpers for calculating redirection rules.
 */
export function FileRedirects(list: G[] = []) {
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
    path(path: string): Path {
      path = typeof path !== 'string' ? '' : path.trim();
      const grant = list
        .reverse() // NB: Catch DENY.
        .filter((item) => typeof item.grep === 'string')
        .find((item) => fs.match(item.grep as string).path(path));

      const isAllowed =
        !grant || grant.action === undefined ? DEFAULT_ALLOW : grant.action === 'ALLOW';

      const flag = isAllowed === DEFAULT_ALLOW ? undefined : isAllowed;

      return {
        path,
        grant,
        isAllowed,
        flag,
      };
    },
  };
}
