import { monaco, is } from '../common';
import { CodeEditorLanguageDefaults } from '../types';

const ADDED_TYPES: string[] = [];

/**
 * Source:
 *    https://github.com/Microsoft/TypeScript/tree/master/lib
 *
 * Instructions given in issue:
 *    https://github.com/Microsoft/monaco-editor/issues/1001
 */
const ECMASCRIPT_DEFS: any = is.browser && {
  es5: require('../../static/@tdb/editor.code.d/lib.es5.d.ts'),
  es2015core: require('../../static/@tdb/editor.code.d/lib.es2015.core.d.ts'),
  es2015collection: require('../../static/@tdb/editor.code.d/lib.es2015.collection.d.ts'),
  es2015generator: require('../../static/@tdb/editor.code.d/lib.es2015.generator.d.ts'),
  es2015promise: require('../../static/@tdb/editor.code.d/lib.es2015.promise.d.ts'),
  es2015iterable: require('../../static/@tdb/editor.code.d/lib.es2015.iterable.d.ts'),
  es2015proxy: require('../../static/@tdb/editor.code.d/lib.es2015.proxy.d.ts'),
  es2015reflect: require('../../static/@tdb/editor.code.d/lib.es2015.reflect.d.ts'),
  es2015symbol: require('../../static/@tdb/editor.code.d/lib.es2015.symbol.d.ts'),
};

/**
 *  Configures language options which show up within Intillisense.
 *  See:
 *    API reference
 *    https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html
 *
 *    Playground example
 *    https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-javascript-defaults
 */
export function configureLanguage(
  settings: CodeEditorLanguageDefaults,
  languageService: monaco.languages.typescript.LanguageServiceDefaults,
) {
  languageService.setCompilerOptions({
    allowNonTsExtensions: true,
    noLib: true,
  });
  let libs = '';

  // Add given type definitions.
  //    https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.typescript.languageservicedefaults.html#addextralib
  //    Note:
  //        Remove `export declare` as this causes the types to now show up
  //        a simple `declare` on it's own seems to work.
  const types = settings.types.map(code => clean(code)).join('\n');

  if (!ADDED_TYPES.includes(types)) {
    ADDED_TYPES.push(types); // NB: Ensure the types are only added once.
    libs += types;
  }

  // Add base ES (Javascript) language definitions.
  if (ECMASCRIPT_DEFS) {
    Object.keys(ECMASCRIPT_DEFS)
      .map(key => ECMASCRIPT_DEFS[key])
      .forEach(lib => (libs += lib));
  }

  // Finish up.
  if (libs) {
    languageService.addExtraLib(libs);
  }
}

/**
 * Internal
 */
function clean(code: string) {
  const lines = code.split('\n').map(line => {
    // Remove ES "import" statements.
    if (line.startsWith('import ')) {
      return '';
    }

    // Remove ES "export" statements.
    if (line.startsWith('export ')) {
      line = line.replace(/^export /, '');
    }

    return line;
  });

  return lines.join('\n');
}
