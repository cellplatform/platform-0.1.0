import { fs } from '@platform/fs';
import * as loader from '@assemblyscript/loader';

type Api = {
  add(a: number, b: number): number;
};

const file = fs.readFileSync(fs.resolve('build/optimized.wasm'));
export default loader.instantiateSync<Api>(file);
