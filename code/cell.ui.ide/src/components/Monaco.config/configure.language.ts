export async function language(monaco: any) {
  const typescript = monaco.languages.typescript;
  const defaults = typescript.typescriptDefaults;

  defaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
    target: typescript.ScriptTarget.ES6,
  });

  // @ts-ignore
  const es = await import('./libs.d.yml');
  const libs: { [filename: string]: string } = es.libs;

  Object.keys(libs).forEach(key => {
    const text = libs[key];
    defaults.addExtraLib(text, `ts:filename/${key}`);
  });

  // TEMP 🐷
  const SAMPLE = `
    declare class Facts {
      static next(): string;
    }
`;
  defaults.addExtraLib(SAMPLE, 'ts:filename/facts.d.ts');
}
