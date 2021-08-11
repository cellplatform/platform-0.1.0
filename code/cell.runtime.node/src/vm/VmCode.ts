import { VMScript } from 'vm2';
import { MemoryCache, time, fs } from '../common';

type Milliseconds = number;

export type CachedScript = {
  script: VMScript;
  elapsed: Milliseconds; // Compile time.
};

/**
 * Compiled scripts.
 */
export const VmCode = {
  cache: MemoryCache.create(),

  /**
   * Loads (or gets from cache) a script.
   */
  async get(filename: string, options: { force?: boolean } = {}) {
    const force = options.force ?? false;

    if (!force && VmCode.cache.exists(filename)) {
      return VmCode.cache.get<CachedScript>(filename);
    }

    const timer = time.timer();
    const code = (await fs.readFile(filename)).toString();
    const script = new VMScript(code, { filename }).compile();

    const res: CachedScript = {
      elapsed: timer.elapsed.msec,
      script,
    };

    VmCode.cache.put(filename, res);
    return res;
  },
};
