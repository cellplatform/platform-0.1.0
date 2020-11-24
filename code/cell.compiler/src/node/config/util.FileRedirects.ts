import { fs, R, t } from '../common';
import { GrepList } from './util.GrepList';

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
export function FileRedirects(input: G[] = []) {
  const list = GrepList(input);

  if (list.negations.length > 0) {
    throw new Error(`Path negations ("!") not supported.`);
  }

  const sortAndOrder = (list: G[] = []): G[] => {
    const groupBy = R.groupBy<G>((b) => b.grep || '');
    const grouped = groupBy(list);
    const items = Object.keys(grouped).reduce((acc, key) => {
      const list = grouped[key];
      acc.push(list[list.length - 1]);
      return acc;
    }, [] as G[]);
    return R.sortWith([R.ascend(R.prop('action'))])(items as any);
  };

  return {
    list: list.all,

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
      return sortAndOrder(list.all);
    },

    /**
     * Resolve whether a path will allow redirects.
     */
    path(input: string): Path {
      const path = typeof input !== 'string' ? '' : input.trim();

      const grant = list.all
        .reverse() // NB: Catch DENY.
        .find((item) => (item.grep ? fs.match(item.grep).path(path) : false));

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
