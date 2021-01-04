import { VMScript } from 'vm2';
import { MemoryCache, time, fs } from '../common';

export type CachedScript = {
  script: VMScript;
  elased: number; // Milliseconds to compile.
};

/**
 * Compiled scripts.
 */
export const VmCode = {
  cache: MemoryCache.create(),

  /**
   * Loads (or gets from cache) a script.
   */
  async get(filename: string) {
    if (VmCode.cache.exists(filename)) {
      return VmCode.cache.get<CachedScript>(filename);
    }

    const timer = time.timer();
    const code = (await fs.readFile(filename)).toString();
    const script = new VMScript(code, { filename }).compile();

    const res: CachedScript = {
      elased: timer.elapsed.msec,
      script,
    };

    VmCode.cache.put(filename, res);
    return res;
  },
};
