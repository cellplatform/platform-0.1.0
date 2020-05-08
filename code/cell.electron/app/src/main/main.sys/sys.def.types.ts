import '../../config';
import { constants, TypeSystem, fs, t, ENV } from '../common';

const SYS = constants.SYS;

/**
 * Initializes an object structure representing the
 * type-definitions for an [App].
 */
export function define() {
  const def = TypeSystem.def();

  def
    .ns(SYS.NS.TYPE)
    .type('App')
    .prop('name', p => p.type('string'))
    .prop('backgroundColor', p => p.type('string').default('#fff'))
    .prop('bundle', p => p.type('string'))
    .prop('windows', p => p.type('/AppWindow[]').target('ref'));

  def
    .type('AppWindow')
    .prop('app', p => p.type('string')) // app.name
    .prop('title', p => p.type('string').default('Untitled'))
    .prop('width', p => p.type('number').default(1000))
    .prop('height', p => p.type('number').default(800))
    .prop('x', p => p.type('number'))
    .prop('y', p => p.type('number'));

  return def.toObject();
}

/**
 * Creates the type-defs if they don't already exist.
 */
export async function ensureExists(args: { client: t.IClientTypesystem }) {
  const { client } = args;

  // Write type-defs.
  if (!(await client.http.ns(SYS.NS.TYPE).exists())) {
    const defs = define();
    await Promise.all(Object.keys(defs).map(ns => client.http.ns(ns).write(defs[ns])));
    if (ENV.isDev) {
      const ts = await client.typescript(SYS.NS.TYPE);
      await ts.save(fs, fs.resolve('src/types.g'));
    }
  }

  // Write root "apps" data sheet.
  const data = client.http.ns(SYS.NS.DATA);
  if (!(await data.exists())) {
    await data.write({ ns: { type: { implements: SYS.NS.TYPE } } });
  }
}
