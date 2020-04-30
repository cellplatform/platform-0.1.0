type Package = { name: string; version: string };

/**
 * Creates a header comment to be inserted into generated Typsecript files.
 */

export function toTypescriptHeader(args: {
  uri: string | string[];
  pkg: Package;
  filename?: string;
}) {
  const filename = args.filename
    ? args.filename.replace(/^\</, '').replace(/\>$/, '')
    : '<filename>';

  const uris = Array.isArray(args.uri) ? args.uri : [args.uri];

  return `
/**
 * Generated types defined in namespace:
 * 
 *    |                
${uris.map(uri => ` *    |➔  ${uri}`).join('\n')}
 *    |
 *
 * By:
 *    ${args.pkg.name}@${args.pkg.version}
 * 
 * Notes: 
 * 
 *    - DO NOT manually edit this file (it will be regenerated automatically).
 *    - DO check this file into source control.
 *    - Usage
 *        Import the [.d.ts] file within the consuming module
 *        that uses a [TypedSheet] to programatically manipulate 
 *        the namespace in a strongly-typed manner, for example:
 * 
 *            import * as t from './${filename}.ts';
 * 
 */`.substring(1);
}
