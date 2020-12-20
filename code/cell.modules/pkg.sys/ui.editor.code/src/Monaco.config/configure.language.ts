import { t } from '../common';

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
  const defaults = ts.typescriptDefaults;

  /**
   * Compiler options
   * See:
   *    - https://www.typescriptlang.org/docs/handbook/compiler-options.html
   *    - https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#setcompileroptions
   */
  defaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
    target: ts.ScriptTarget.ES2015, // NB: "ES6".
    alwaysStrict: true,
    typeRoots: ['node_modules/@types'],
  });

  /**
   * Suppress certain diagnostic errors (red underline warnings).
   * See:
   *    - https://github.com/microsoft/monaco-typescript/pull/46
   */
  const CODES = {
    // TOP_LEVEL_RETURN: 1108, // Useful when the code editor contains a root level script that is being wrapped within a function.
    CANNOT_REDECLARE_BLOCK_SCOPED_VAR: 2451, // Occurs when two editors on the same page have variables that collide and no import/export statment exists that indicate that the file should be considered a "module".
  };
  defaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: Object.values(CODES),
  });

  await Promise.all([
    api.libs.loadDefs('lib.es.d.ts'),
    // api.libs.loadDefs('lib.cell.d.ts'), // TODO 🐷 - this needs updating to: [Runtime/types.inner.env].
    //
  ]);
}
