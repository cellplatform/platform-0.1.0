import * as t from './types';
import * as fs from 'fs';
import * as path from 'path';

const params = (env.in.value || {}) as t.ISampleNodeInValue;

/**
 * Test play around with WASM.
 *
 * - https://www.codepool.biz/use-webassembly-node-js.html
 * - https://wasdk.github.io/WasmFiddle/
 *
 */

async function load() {
  const filename = path.resolve(path.join(__dirname), 'static/func.wasm');
  const source = fs.readFileSync(filename);
  const typedArray = new Uint8Array(source);

  const env = {
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({ initial: 256 }),
    table: new WebAssembly.Table({
      initial: 0,
      element: 'anyfunc',
    }),
  };

  const wasm = await WebAssembly.instantiate(typedArray, { env });
  const func = wasm.instance.exports as any;

  return { filename, func };
}

/**
 * Run WASM
 */
(async () => {
  const { func } = await load();
  const result = func.add(params.count || 0, 10);
  env.out.done({ count: result });
})();
