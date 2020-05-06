import { constants, TypeSystem } from '../common';

const NS = constants.SYS.NS;
const def = TypeSystem.def();

def
  .ns(NS.TYPE.APP)
  .type('SysApp')
  .prop('title', { type: 'string', default: 'CellOS' })
  .prop('windowDefs', p => p.type('/SysAppWindowDef[]').target('ref'))
  .prop('windows', p => p.type('/SysAppWindow[]').target('ref'));

def
  .ns(NS.TYPE.WINDOW_DEF)
  .type('SysAppWindowDef')
  .prop('kind', p => p.type('string').default(''))
  .prop('width', p => p.type('number').default(1200))
  .prop('height', p => p.type('number').default(800));

def
  .ns(NS.TYPE.WINDOW)
  .type('SysAppWindow')
  .prop('id', p => p.type('string').default(''))
  .prop('kind', p => p.type('string').default(''))
  .prop('title', p => p.type('string').default('Untitled'))
  .prop('width', p => p.type('number').default(-1))
  .prop('height', p => p.type('number').default(-1))
  .prop('x', 'number')
  .prop('y', 'number');

export const DEFS = def.toObject();
