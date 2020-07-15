import { t } from '../../common';
import * as util from './util';

/**
 * 🏷REFS (how to):
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
export async function language(monaco: t.IMonaco) {
  const typescript = monaco.languages.typescript;
  const typescriptDefaults = typescript.typescriptDefaults;

  /**
   * Compiler options:
   *    - https://www.typescriptlang.org/docs/handbook/compiler-options.html
   *    - https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#setcompileroptions
   */
  typescriptDefaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
    target: typescript.ScriptTarget.ES2015, // NB: ES6.
  });

  const addLib = (filename: string, content: string) => {
    filename = util.formatFilename(filename);
    content = util.formatDeclarationContent(content);
    typescriptDefaults.addExtraLib(content, filename);
  };

  const addFromYaml = async (libs: { [filename: string]: string }) => {
    Object.keys(libs).forEach((filename) => addLib(filename, libs[filename]));
  };

  /**
   * Load standard ECMAScript language types.
   */
  /* eslint-disable */

  // @ts-ignore
  const es = await import('./libs-es.d.yml');
  await addFromYaml(es.libs);

  // @ts-ignore
  const cell = await import('./libs-cell.d.yml');
  await addFromYaml(cell.libs);

  /* eslint-enable */
}
