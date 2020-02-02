import { fs } from '@platform/fs';
import * as loader from '@assemblyscript/loader';

type Module = {
  add(a: number, b: number): number;
};

const file = fs.readFileSync(fs.resolve('build/optimized.wasm'));
export default loader.instantiateSync<Module>(file, {
  index: {
    consoleLog: (value: any) => console.log(value),
    foo: (obj: any) => console.log(obj),
  },
});
