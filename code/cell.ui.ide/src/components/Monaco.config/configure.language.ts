import { t } from '../../common';

/**
 * Configure language (typescript) settings of the IDE.
 */
export async function language(monaco: t.IMonaco) {
  const typescript = monaco.languages.typescript;
  const defaults = typescript.typescriptDefaults;

  /**
   * Compiler options:
   *    - https://www.typescriptlang.org/docs/handbook/compiler-options.html
   *    - https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#setcompileroptions
   */
  defaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
    target: typescript.ScriptTarget.ES2015,
  });

  const addLib = (filename: string, text: string) => {
    defaults.addExtraLib(text, `ts:filename/${filename}`);
  };

  /**
   * Load standard ECMAScript language types.
   */
  // @ts-ignore
  const es = await import('./libs.d.yml');
  const libs: { [filename: string]: string } = es.libs;
  Object.keys(libs).forEach(filename => addLib(filename, libs[filename]));

  /**
   * TODO 🐷
   * - TEMP
   */
  const SAMPLE = `
      declare class Facts {
        static next(): string;
      }
  `;
  addLib('fact.d.ts', SAMPLE);
}
