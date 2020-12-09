import { log, t, bundle, http } from '../../common';
import * as util from './util';

/**
 * REFS (how to):
 *
 *    Details for handling different libs for different editor windows:
 *    https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf
 *
 *    Adding snippets:
 *    https://stackoverflow.com/questions/48212023/how-to-insert-snippet-in-monaco-editor
 */

/**
 * Configure language (typescript) settings of the IDE.
 */
export async function language(api: t.IMonacoSingleton) {
  const ts = api.monaco.languages.typescript;

  /**
   * Compiler options:
   *    - https://www.typescriptlang.org/docs/handbook/compiler-options.html
   *    - https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#setcompileroptions
   */
  ts.typescriptDefaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
    target: ts.ScriptTarget.ES2015, // NB: "ES6".
  });

  await Promise.all([
    loadDefs(api, 'lib.es.d.ts'),
    loadDefs(api, 'lib.cell.d.ts'),
    //
  ]);

  // const addLib = (filename: string, content: string) => {
  //   filename = util.formatFilename(filename);
  //   content = util.formatDeclarationContent(content);
  //   ts.addExtraLib(content, filename);
  // };

  // const addFromYaml = async (libs: { [filename: string]: string }) => {
  //   Object.keys(libs).forEach((filename) => addLib(filename, libs[filename]));
  // };

  // TODO 🐷

  /**
   * Load standard ECMAScript language types.
   */
  /* eslint-disable */

  // @ts-ignore
  // const es = await import('./libs-es.d.yml');
  // await addFromYaml(es.libs);

  // @ts-ignore
  // const cell = await import('./libs-cell.d.yml');
  // await addFromYaml(cell.libs);

  /* eslint-enable */
}

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
    return res.json as t.TypeFileManifest;
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

const loadDefs = async (api: t.IMonacoSingleton, dir: string) => {
  dir = bundle.path(`static/types/${dir}`);
  const manifest = await loadManifest(dir);

  const files = await Promise.all(
    manifest.files
      .map((file) => file.filename)
      .map((filename) => loadDeclarationFile(dir, filename)),
  );

  files.forEach((file) => {
    api.lib.add(file.filename, file.content);
  });
};
