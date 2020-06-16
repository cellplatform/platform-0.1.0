import { constants, TypeSystem } from '../common';

const SYS = constants.SYS;

/**
 * Initializes an object structure representing the
 * type-definitions for an [App].
 */
export function declare() {
  const def = TypeSystem.def();

  /**
   * Defines an application module.
   */
  def
    .ns(SYS.NS.TYPE)
    .type('App')
    .prop('name', (p) => p.type('string'))
    .prop('backgroundColor', (p) => p.type('string').default('#fff'))
    .prop('fs', (p) => p.type('string').default('fs'))
    .prop('bytes', (p) => p.type('number').default(-1))
    .prop('entry', (p) => p.type('string'))
    .prop('devPort', (p) => p.type('number').default(1234))
    .prop('devTools', (p) => p.type('boolean').default(false))
    .prop('windows', (p) => p.type('/AppWindow[]').target('ref'))
    .prop('width', (p) => p.type('number').default(1000))
    .prop('height', (p) => p.type('number').default(800))
    .prop('minWidth?', (p) => p.type('number'))
    .prop('minHeight?', (p) => p.type('number'));

  /**
   * Defines a window instance of an {App}.
   */
  def
    .type('AppWindow')
    .prop('app', (p) => p.type('string')) // {app.name}
    .prop('title', (p) => p.type('string').default('Untitled'))
    .prop('width', (p) => p.type('number'))
    .prop('height', (p) => p.type('number'))
    .prop('x', (p) => p.type('number'))
    .prop('y', (p) => p.type('number'))
    .prop('isVisible', (p) => p.type('boolean').default(true));

  return def.toObject();
}
