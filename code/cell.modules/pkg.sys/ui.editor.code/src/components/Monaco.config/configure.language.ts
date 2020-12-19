import { t } from '../../common';

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
export async function registerLanguage(api: t.IMonacoSingleton) {
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
    alwaysStrict: true,
  });

  await Promise.all([
    api.libs.loadDefs('lib.es.d.ts'),
    // api.libs.loadDefs('lib.cell.d.ts'), // TODO 🐷 - this needs updating to: [Runtime/types.inner.env].
    //
  ]);
}
