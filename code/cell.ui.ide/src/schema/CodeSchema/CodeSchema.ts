import { TypeSystem, Uri, t } from '../../common';

/**
 * Schema for storing code.
 */
export class CodeSchema {
  public static declare(options: { namespaces?: Partial<t.ICodeNamespaces> } = {}) {
    const def = TypeSystem.def();
    const namespaces = toNamespaces(options.namespaces || {});

    /**
     * A code-file.
     */
    def
      .ns(namespaces.CodeFile)
      .type('CodeFile')
      .prop('name', (p) => p.type('string'))
      .prop('path', (p) => p.type('string'))
      .prop('language', (p) => p.type('string'))
      .prop('languageVersion', (p) => p.type('string')) // semver
      .prop('text', (p) => p.type('string'));

    // def
    //   .ns(namespaces.Code)
    //   .type('Code')
    //   .prop('code', (p) => p.type(`${namespaces.CodeFile}/CodeFile`).target('inline:code'));

    /**
     * Language.
     */
    // def
    //   .ns(namespaces.Language)
    //   .type('Language')
    //   .prop('name', (p) => p.type('string'));

    // Finish up.
    return { namespaces, def };
  }
}

/**
 * [Helpers]
 */

const toNamespaces = (input: Partial<t.ICodeNamespaces>): t.ICodeNamespaces => {
  const ns = (input?: string) => Uri.toNs(input).toString();
  return {
    Code: ns(input.Code),
    CodeFile: ns(input.CodeFile),
    // Language: ns(input.Language),
  };
};
