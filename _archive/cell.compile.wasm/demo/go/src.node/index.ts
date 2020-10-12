// const f = require('../dist/wasm-exec.js');
import '../dist/wasm-exec';

import { fs } from '@platform/fs';

/**
 * NOTE: Does not work.
 * Error:
 *    TypeError: WebAssembly.instantiate(): Import #0 module="go" error:
 *    module is not an object or function
 *
 */
(async () => {
  try {
    const buffer = await fs.readFile(fs.resolve('dist/lib.wasm'));
    const typedArray = new Uint8Array(buffer);

    const go = new (global as any).Go();

    // const wasm = await WebAssembly.instantiate(typedArray, { env });
    const importObject = { ...go.importObject };
    const wasm = await WebAssembly.instantiate(typedArray, importObject);

    console.log('-------------------------------------------');
    go.run(wasm.instance);
    console.log('-------------------------------------------');

    // console.log('instance.add(1,2)', instance.add(1, 2));

    const g = global as any;

    console.log('global.add', g.add(1, 20, 5));

    // const r = g.obj();

    const obj = [{ msg: 'hello' }];

    const json = JSON.parse(g.obj('red'));
    console.log('json:', json);

    console.log('-------------------------------------------');
  } catch (error) {
    console.log('ERROR', error);
  }
})();
