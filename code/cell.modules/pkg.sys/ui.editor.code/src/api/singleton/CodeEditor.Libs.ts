import { t, http, bundle } from '../../common';

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
   * Adds a type-definition library to the editor.
   */
  const add: M['add'] = (filename: string, content: string) => {
    filename = (filename || '').trim() || 'unnamed.ts';
    filename = filename.replace(/^file\:/, '').replace(/^\/*/, '');
    filename = `file:///${filename}`;

    const ts = monaco.languages.typescript.typescriptDefaults;
    const { dispose } = ts.addExtraLib(content, filename);
    const ref: t.ICodeEditorAddedLib = { filename, dispose };

    list = [...list, { filename, dispose }];
    return ref;
  };

  /**
   * Loads type-definitions from an HTTP source.
   *
   *    Pass either a complete URL, or the relative path to the type files the
   *    editor is served from.  This should point to a directory which contains
   *    [TypeFileManifest] file named "/index.json".
   *
   */
  const loadDefs: M['loadDefs'] = async (urlOrFolder) => {
    const isUrl = urlOrFolder.startsWith('http');
    const dir = isUrl ? urlOrFolder : bundle.path(`static/types/${urlOrFolder}`);
    const manifest = await loadManifest(dir);
    const files = await Promise.all(
      manifest.files.map((file) => file.path).map((filename) => loadDeclarationFile(dir, filename)),
    );
    return files.map((file) => add(file.filename, file.content));
  };

  /**
   * Removes all type-definition libraries from the editor.
   */
  const clear: M['clear'] = () => {
    list.forEach((ref) => ref.dispose());
    list = [];
  };

  return {
    get list() {
      return list;
    },
    add,
    clear,
    loadDefs,
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

function formatDeclarationContent(content: string) {
  content = content.replace(/export declare /g, 'declare ');
  return content;
}
