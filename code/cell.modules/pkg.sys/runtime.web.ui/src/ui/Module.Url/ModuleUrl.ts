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
   * Takes any incoming HREF and ensures the final filename on the path
   * is the "index.json" manifest URL.
   */
  toManifestUrl(href: string) {
    const url = new URL(href);
    url.pathname = `${ModuleUrl.parsePath(url.pathname).path}index.json`;
    return url;
  },

  removeFilename(input: string | URL) {
    const url = typeof input === 'string' ? new URL(input) : input;
    url.pathname = `${ModuleUrl.parsePath(url.pathname).path}`;
    return url;
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

  /**
   * Interpret a URL path.
   */
  parsePath(input: string) {
    input = (input || '').trim();
    input = `/${input.replace(/^\/*/, '')}`;

    const parts = (input || '').trim().split('/');
    const last = parts[parts.length - 1];

    const extensions = ['.js', '.json', '.css', '.svg', '.png', '.jpg', '.pdf', '.html', '.html'];
    const isFile = !last.endsWith('/') && extensions.some((ext) => last.endsWith(ext));

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
};
