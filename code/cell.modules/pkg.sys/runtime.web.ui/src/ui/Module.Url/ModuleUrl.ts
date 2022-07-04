import { t } from '../common';

const NONE = 'none';

export const ModuleUrl = {
  /**
   * Parse the given URL into a useful structure for interpreting a module.
   */
  parse(href: string, options: { entry?: string } = {}): t.ModuleUrl {
    try {
      const url = new URL(href);

      if (!url.pathname.endsWith('/index.json')) {
        url.pathname = `${url.pathname.replace(/\/*$/, '')}/index.json`;
      }

      let entry: string | undefined = options.entry ?? (url.searchParams.get('entry') || NONE);
      if (entry) {
        if (entry !== NONE) {
          entry = ModuleUrl.formatEntryPath(entry);
          url.searchParams.set('entry', entry);
        }
        if (entry === NONE) {
          url.searchParams.delete('entry');
          entry = undefined;
        }
      }

      return {
        href: url.href,
        manifest: `${url.origin}${url.pathname}`,
        entry,
      };
    } catch (error: any) {
      return {
        href: '',
        manifest: '',
        error: `Failed to parse href "${href}", ${error.message}`,
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
