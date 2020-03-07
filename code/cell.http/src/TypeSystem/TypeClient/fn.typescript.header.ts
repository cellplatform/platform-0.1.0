type Package = { name: string; version: string };

/**
 * The header inserted into generated Typsecript files.
 */

export function toTypescriptHeader(args: { uri: string; pkg: Package; schema: Package }) {
  return `
  /**
   * Generated types defined in namespace:
   * 
   *    |                
   *    |➔  ${args.uri}
   *    |
   * 
   * By:
   *    module:  ${args.pkg.name}@${args.pkg.version}
   *    schema:  ${args.schema.name}@${args.schema.version}
   * 
   * Notes: 
   * 
   *    - DO NOT manually edit this file (it will be regenerated automatically).
   *    - DO check this file into source control.
   *    - Usage
   *        Import the [.d.ts] file within the consuming module
   *        that uses a [TypedSheet] to programatically manipulate 
   *        the namespace in a strongly-typed manner.
   * 
   */`.substring(1);
}
