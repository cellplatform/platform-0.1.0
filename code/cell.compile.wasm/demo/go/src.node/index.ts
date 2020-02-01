import { fs } from '@platform/fs';

/**
 * NOTE: Does not work.
 * Error:
 *    TypeError: WebAssembly.instantiate(): Import #0 module="go" error:
 *    module is not an object or function
 *
 */
(async () => {
  const buffer = await fs.readFile(fs.resolve('dist/lib.wasm'));
  const typedArray = new Uint8Array(buffer);

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

  console.log('-------------------------------------------');
  console.log('func', func);
})();
