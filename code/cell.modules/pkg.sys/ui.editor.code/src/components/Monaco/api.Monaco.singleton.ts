import { t, http, bundle } from '../../common';
import { configure } from '../Monaco.config';

/**
 * Singleton instance of an initialized Monaco Editor.
 * This is used to programatically manipulate the editor(s).
 *
 *    https://microsoft.github.io/monaco-editor/api/index.html
 *
 */
export const MonacoSingleton = {
  create(monaco: t.IMonaco): t.IMonacoSingleton {
    let libs: t.IMonacoAddedLib[] = [];

    /**
     * API for adding and removing type definition libraries to the editor.
     */
    const lib: t.IMonacoSingleton['lib'] = {
      /**
       * Adds a type-definition library to the editor.
       */
      add(filename: string, content: string) {
        filename = configure.formatFilename(filename);
        const ts = monaco.languages.typescript.typescriptDefaults;
        const { dispose } = ts.addExtraLib(content, filename);
        const ref: t.IMonacoAddedLib = { filename, dispose };
        libs = [...api.libs, { filename, dispose }];
        return ref;
      },

      /**
       * Loads type-definitions from an HTTP source.
       *
       *    Pass either a complete URL, or the relative path to the type files the
       *    editor is served from.  This should point to a directory which contains
       *    [TypeFileManifest] file named "/index.json".
       *
       */
      async loadDefs(urlOrFolder: string) {
        const isUrl = urlOrFolder.startsWith('http');
        const dir = isUrl ? urlOrFolder : bundle.path(`static/types/${urlOrFolder}`);
        const manifest = await loadManifest(dir);
        const files = await Promise.all(
          manifest.files
            .map((file) => file.path)
            .map((filename) => loadDeclarationFile(dir, filename)),
        );
        return files.map((file) => api.lib.add(file.filename, file.content));
      },

      /**
       * Removes all type-definition libraries from the editor.
       */
      clear() {
        libs.forEach((ref) => ref.dispose());
        libs = [];
      },
    };

    const api: t.IMonacoSingleton = {
      monaco,
      lib,
      get libs() {
        return libs;
      },
    };

    return api;
  },
};

/**
 * [Helpers]
 */

const loadManifest = async (dir: string) => {
  const url = `${dir}/index.json`;
  const res = await http.get(url);
  if (!res.ok) {
    const err = `Failed to load type-definition manifest '${url}'. ${res.status}: ${res.statusText}`;
    throw new Error(err);
  } else {
    return res.json as t.FsManifest;
  }
};

const loadDeclarationFile = async (dir: string, filename: string) => {
  const url = `${dir}/${filename}`;
  const res = await http.get(url);
  if (!res.ok) {
    const err = `Failed to load type-definition '${url}'. ${res.status}: ${res.statusText}`;
    throw new Error(err);
  } else {
    return {
      url,
      filename: filename.replace(/\.txt$/, '.ts'),
      content: res.text,
    };
  }
};
