import { t, http, Is } from '../common';

type M = t.ICodeEditorLibs;

/**
 * Helpers for adding type-definition libraries to the editor (global singleton).
 *
 * Refs:
 *    - https://microsoft.github.io/monaco-editor/api/index.html
 *    - https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#addextralib
 *
 */
export function CodeEditorLibs(monaco: t.IMonaco): t.ICodeEditorLibs {
  let list: t.ICodeEditorAddedLib[] = [];

  /**
   * Removes all type-definition libraries from the editor.
   */
  const clear: M['clear'] = () => {
    list.forEach((ref) => ref.dispose());
    list = [];
  };

  /**
   * Adds a type-definition library to the editor.
   */
  const add: M['add'] = (filename: string, content: string) => {
    filename = (filename || '').trim() || 'unnamed.ts';
    filename = filename.replace(/^file:/, '').replace(/^\/*/, '');
    filename = `file:///${filename}`;

    const ts = monaco.languages.typescript.typescriptDefaults;
    const { dispose } = ts.addExtraLib(content, filename);
    const ref: t.ICodeEditorAddedLib = { filename, dispose };

    list = [...list, { filename, dispose }];
    return ref;
  };

  /**
   * Loads type-definitions from an HTTP source.
   */
  const fromNetwork: M['fromNetwork'] = async (url) => {
    const fromManifest = async (url: string) => {
      const manifest = await loadManifest(url);
      return Promise.all(
        manifest.files
          .map((file) => file.path)
          .map((filename) => loadDeclarationFile(url, filename)),
      );
    };

    if (Is.declarationFileUrl(url)) {
      /**
       * TODO 🐷
       */

      const index = url.lastIndexOf('/');
      const filename = index >= 0 ? url.substring(index + 1) : url;
      const dir = index >= 0 ? url.substring(0, index) : '';
      const file = await loadDeclarationFile(dir, filename);
      return [add(file.filename, file.content)];
    } else {
      const files = await fromManifest(url);
      return files.map((file) => add(file.filename, file.content));
    }
  };

  return {
    get list() {
      return list;
    },
    add,
    clear,
    fromNetwork,
  };
}

/**
 * Helpers
 */

const loadManifest = async (base: string) => {
  const url = `${base}/index.json`;
  const res = await http.get(url);
  if (!res.ok) {
    const err = `Failed to load type-definition manifest '${url}'. ${res.status}: ${res.statusText}`;
    throw new Error(err);
  } else {
    return res.json as t.TypelibManifest;
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

function formatDeclarationContent(content: string) {
  content = content.replace(/export declare /g, 'declare ');
  return content;
}
