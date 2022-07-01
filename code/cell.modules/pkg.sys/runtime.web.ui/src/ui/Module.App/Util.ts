import { t } from './common';

export const Util = {
  /**
   * Parse the url
   */
  parseUrl(href: string, options: { entry?: string } = {}): t.ModuleAppUrl {
    try {
      const url = new URL(href);

      if (!url.pathname.endsWith('/index.json')) {
        url.pathname = `${url.pathname.replace(/\/$/, '')}/index.json`;
      }

      const entry = options.entry ?? url.searchParams.get('entry') ?? undefined;
      if (entry && entry !== 'none') url.searchParams.set('entry', Util.formatEntryPath(entry));

      return {
        href: url.href,
        manifest: `${url.origin}${url.pathname}`,
        entry,
      };
    } catch (error: any) {
      return {
        href: '',
        manifest: '',
        error: `Failed to parse href, ${error.message}`,
      };
    }
  },

  /**
   * Ensure an "entry=<path>" is correctly formatted.
   */
  formatEntryPath(path: string) {
    return `./${path.replace(/^\.\//, '')}`;
  },

  /**
   * Trim entry path
   */
  trimEntryPath(path?: string | null) {
    return (path || '').replace(/^\.\//, '');
  },
};
