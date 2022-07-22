import { t } from '../common';

/**
 * TODO 🐷
 * Remove "entry=none" querystring
 */
const NONE = 'none';

export const ModuleUrl = {
  /**
   * Parse the given URL into a useful structure for interpreting a module.
   */
  parseUrl(href: string, options: { entry?: string } = {}): t.ModuleUrlParts {
    try {
      const url = new URL(href);

      if (!url.pathname.endsWith('/index.json')) {
        url.pathname = `${url.pathname.replace(/\/*$/, '')}/index.json`;
      }

      let entry: string | undefined = options.entry ?? (url.searchParams.get('entry') || NONE);
      if (entry) {
        const set = (value?: string) => {
          if (value) url.searchParams.set('entry', value);
          if (!value) url.searchParams.delete('entry');
          return value;
        };

        if (entry !== NONE) {
          entry = set(ModuleUrl.formatEntryPath(entry));
        }
        if (entry === NONE) {
          entry = set(undefined);
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

  fileExtensions: ['js', 'json', 'css', 'svg', 'png', 'jpg', 'jpeg', 'pdf', 'html', 'html'],

  /**
   * Interpret a URL path.
   */
  path(input: string) {
    input = (input || '').trim();
    input = `/${input.replace(/^\/*/, '')}`;

    const parts = (input || '').trim().split('/');
    const last = parts[parts.length - 1];

    const exts = ModuleUrl.fileExtensions;
    const isFile = !last.endsWith('/') && exts.some((ext) => last.endsWith(`.${ext}`));

    const filename = isFile ? last : '';
    const file = !isFile
      ? undefined
      : {
          name: filename.substring(0, filename.lastIndexOf('.')),
          ext: filename.substring(filename.lastIndexOf('.') + 1),
        };

    let path = isFile ? input.substring(0, input.length - filename.length) : input;
    path = `${path.replace(/\/*$/, '/')}`;

    return {
      path,
      filename,
      file,
      toString: () => `${path}${filename}`,
    };
  },

  /**
   * Takes any incoming HREF and ensures the final filename on the path
   * is the "index.json" manifest URL.
   */
  ensureManifest(href: string) {
    const url = new URL(href);
    url.pathname = `${ModuleUrl.path(url.pathname).path}index.json`;
    return url;
  },

  removeFilename(href: string) {
    const url = new URL(href);
    url.pathname = `${ModuleUrl.path(url.pathname).path}`;
    return url;
  },

  /**
   * Ensure an "entry=<path>" is correctly formatted.
   */
  formatEntryPath(path: string) {
    path = (path || '').trim().replace(/^\.\//, '');
    return path ? `./${path}` : '';
  },

  /**
   * Trim entry path
   */
  trimEntryPath(path?: string | null) {
    return (path || '').trim().replace(/^\.\//, '');
  },
};
