import { TypeSystem, Uri } from '../common';

/**
 * Initializes an object structure representing the
 * type-definitions for an [App].
 */
export function declare() {
  const def = TypeSystem.def();

  const generate = () => Uri.toNs(Uri.cuid()).toString();
  const namespaces = {
    App: generate(),
    AppWindow: generate(),
    AppData: generate(),
  };

  /**
   * An application module definition.
   */
  def
    .ns(namespaces.App)
    .type('App')
    .prop('name', (p) => p.type('string'))
    .prop('argv', (p) => p.type('string[]'))
    .prop('fs', (p) => p.type('string').default('fs'))
    .prop('bytes', (p) => p.type('number').default(-1))
    .prop('entry', (p) => p.type('string'))
    .prop('devPort', (p) => p.type('number').default(1234))
    .prop('devTools', (p) => p.type('boolean').default(false))
    .prop('width', (p) => p.type('number').default(1000))
    .prop('height', (p) => p.type('number').default(800))
    .prop('minWidth?', (p) => p.type('number'))
    .prop('minHeight?', (p) => p.type('number'))
    .prop('windows', (p) => p.type('/AppWindow[]').target('ref'))
    .prop('data', (p) => p.type('/AppData[]').target('ref'));

  /**
   * A single window instance of an {App}.
   */
  def
    .ns(namespaces.AppWindow)
    .type('AppWindow')
    .prop('app', (p) => p.type('string')) // REF: =app(row)
    .prop('title', (p) => p.type('string').default('Untitled'))
    .prop('width', (p) => p.type('number'))
    .prop('height', (p) => p.type('number'))
    .prop('x', (p) => p.type('number'))
    .prop('y', (p) => p.type('number'))
    .prop('isVisible', (p) => p.type('boolean').default(true));

  /**
   * The entry-point for the data of an application.
   */
  def
    .ns(namespaces.AppData)
    .type('AppData')
    .prop('app', (p) => p.type('string')) // REF: =app(row)
    .prop('window', (p) => p.type('string')) // {AppWindow.uri}
    .prop('fs', (p) => p.type('string').default('fs'))
    .prop('tmp', (p) => p.type('string'));

  // Finish up.
  return {
    namespaces,
    toObject: () => def.toObject(),
    toTypeDefs: () => def.toTypeDefs(),
  };
}
