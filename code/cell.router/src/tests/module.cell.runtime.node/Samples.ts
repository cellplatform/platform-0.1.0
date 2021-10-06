import { Compiler, TestCompile } from '../../test';

const ENTRY = {
  NODE: './src/tests/module.cell.runtime.node/sample.NodeRuntime',
  PIPE: './src/tests/module.cell.runtime.node/sample.pipe',
  V1: './src/tests/module.cell.runtime.node/sample.v1',
  V2: './src/tests/module.cell.runtime.node/sample.v2',
  LONG_RUNNING: './src/tests/module.cell.runtime.node/sample.longrunning',
};

export const Samples = {
  node: TestCompile.make(
    'NodeRuntime',
    Compiler.config('NodeRuntime')
      .namespace('sample')
      .target('node')
      .entry(`${ENTRY.NODE}/main`)
      .entry('dev', `${ENTRY.NODE}/dev`)
      .entry('web', `${ENTRY.NODE}/web`)
      .entry('wasm', `${ENTRY.NODE}/wasm`)
      .static(`${ENTRY.NODE}/static`),
  ),

  pipe: TestCompile.make(
    'pipe',
    Compiler.config('pipe').namespace('sample').target('node').entry(`${ENTRY.PIPE}/main`),
  ),

  longRunning: TestCompile.make(
    'longrunning',
    Compiler.config().namespace('longrunning').target('node').entry(`${ENTRY.LONG_RUNNING}/main`),
  ),

  v1: TestCompile.make(
    'sample-v1',
    Compiler.config()
      .namespace('sample.version')
      .version('1.0.0')
      .target('node')
      .entry(`${ENTRY.V1}/main`),
  ),

  v2: TestCompile.make(
    'sample-v2',
    Compiler.config()
      .namespace('sample.version')
      .version('2.0.0')
      .target('node')
      .entry(`${ENTRY.V2}/main`),
  ),
};
