import { fs, t } from '../../common';

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export async function transpile(
  args: t.TsCompilerTranspileArgs & { tsconfig: t.TsCompilerConfig },
) {
  //
  return null as any;
}
