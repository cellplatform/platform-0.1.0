import { t, fs } from '../common';

/**
 * TODO 🐷
 *
 * Test play around with WASM.
 *
 * - https://www.codepool.biz/use-webassembly-node-js.html
 * - https://wasdk.github.io/WasmFiddle/
 *
 */
export const handleWasmTmp: t.RouteHandler = async req => {
  const source = await fs.readFile(fs.resolve('../src/test/assets/func.wasm'));
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
  const func = wasm.instance.exports;

  return {
    data: { add: func.add(123, 1) },
  };
};
